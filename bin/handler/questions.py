# coding: utf-8
import logging
import base64
import json
import traceback

from config import cookie_conf
from runtime import g_rt

from house_base.base_handler import BaseHandler
from house_base.questions import Questions
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session
from house_base import define
import tools

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()


class QuestionsListHandler(BaseHandler):

    _get_handler_fields = []
    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        ret = []
        data = Questions.load_all()
        ret.extend(data)
        return json.dumps(ret)


class QuestionAddHandler(BaseHandler):

    _post_handler_fields = [
        Field('name', T_STR, False),
        Field('category', T_STR, False),
        Field('parent', T_INT, False),
        Field('save_type', T_INT, False),
        Field('content', T_STR, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        data = {}
        params = self.validator.data
        log.debug('class=QuestionAddHandler|params=%s', params)
        name = self.req.input()['name']
        save_type = params['save_type']
        category = params['category']
        content = self.req.input()['content']
        # 如果是答案且存储类型为富文本校验content
        if content:
            base64_str = base64.b64encode(content)
            params['content'] = base64_str

        params['name'] = name
        params.update({
            'utime': tools.gen_now_str(),
            'ctime': tools.gen_now_str(),
        })
        ret = Questions.create(params)
        return success(data=data)


class QuestionViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('question_id', T_INT, False),
    ]

    _post_handler_fields = [
        Field('name', T_STR, True),
        Field('status', T_INT, True),
        Field('content', T_STR, True),
        Field('question_id', T_INT, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        log.debug('class=QuestionViewHandler|params=%s', params)
        name = self.req.input()['name']
        params['name'] = name
        question_id = params.get('question_id')
        question = Questions(question_id)
        question.load()
        if question.data['content']:
            content = base64.decode(question.data['content'])
            params['content'] = content
        return success(data=question.data)


    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        data = {}
        values = {}
        params = self.validator.data
        question_id = params.pop('question_id')
        status = params.pop('status')
        name = params.pop('name')
        content = self.req.input().get('content')
        if status:
            values['status'] = status
        if name:
            values['name'] = name
        if content:
            content_str = base64.b64encode(content)
            values['content'] = content_str
        values['utime'] = tools.gen_now_str()
        question = Questions(question_id)
        ret = question.update(values)
        return success(data=data)


class QuestionsNewListHandler(BaseHandler):

    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('name', T_STR, True),
        Field('parent', T_INT, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data = {}

        params = self.validator.data
        info, num = Questions.page(**params)
        data['num'] = num
        if info:
            for item in info:
                item['id'] = str(item['id'])
                item['parent'] = str(item['parent'])
                item['ctime'] = tools.trans_datetime(item['ctime'])
                item['utime'] = tools.trans_datetime(item['utime'])
                item['status_desc'] = define.QUESTION_STATUS[item['status']]
                item['category_desc'] = define.QUESTION_MAP[item['category']]
                if item['parent'] != -1:
                    question = Questions(item['id'])
                    question.load()
                    parent_parent = question.find_parent_parent()
                    item['parent_parent'] = parent_parent
                else:
                    item['parent_parent'] = -1
        data['info'] = info
        return success(data=data)


class QuestionsLazyLoadHandler(BaseHandler):
    '''
    默认返回所有parent=-1的根问题，其它点击加载
    '''

    _get_handler_fields = [
        Field('parent', T_INT, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        ret = []
        params = self.validator.data
        parent = params.get('parent')
        if not parent:
            parent = -1
        data = Questions.load_current_children(parent=parent)
        if data:
            for record in data:
                if not record['content']:
                    continue
                else:
                    content = base64.b64decode(record['content'])
                    record['content'] = content
        ret.extend(data)
        return json.dumps(ret)
