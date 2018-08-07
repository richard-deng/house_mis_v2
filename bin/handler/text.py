# coding: utf-8
import logging
import base64
import traceback

from config import cookie_conf
from config import BASE_URL
from runtime import g_rt
from house_base import define
from house_base import tools as base_tools
from house_base.base_handler import BaseHandler
from house_base.box_list import BoxList
from house_base.text_info import TextInfo
from house_base.text_info import TextDetail
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()

class TextInfoCreateHandler(BaseHandler):

    _post_handler_fields = [
        Field('box_id', T_INT, False),
        Field('name', T_STR, False),
        Field('content', T_STR, True),
        Field('icon', T_STR, False),
        Field('available', T_INT, False),
        Field('save_type', T_INT, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        content_str = ''
        params = self.validator.data
        save_type = params['save_type']
        content = params.pop('content')
        box_id = params.get('box_id')
        box = BoxList(box_id)
        box.load()
        if not box.data:
            return error(errcode=RESP_CODE.DATAERR)
        # 检查名称
        ret, text_id = TextInfo.create(params)
        log.debug('class=TextInfoCreateHandler|create text info ret=%s', ret)
        if ret != 1:
            return error(errcode=RESP_CODE.DATAERR)
        if save_type == define.SAVE_TYPE_FILE:
            return success(data={})        
        log.debug('content=%s', content)
        if isinstance(content, list) and content:
            for item in content:
                content_str += item
        else:
            content_str = content
        base64_str = base64.b64encode(content_str)
        log.debug('base64_str=%s', base64_str)
        detail_values = {
            'content': base64_str,
            'text_id': text_id
        }
        ret = TextDetail.create(detail_values)
        log.debug('class=TextInfoCreateHandler|create text detail ret=%s', ret)
        return success(data={})


class TextInfoListHandler(BaseHandler):

    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('name', T_STR, True),
        Field('box_name', T_STR, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data = {}
        params = self.validator.data

        info, num = TextInfo.page_new(**params)
        data['num'] = num
        if info:
            # boxs = BoxList.load_all(where={})
            # box_name_map = {}
            # for box in boxs:
            #     box_name_map[box['id']] = box['name']
            for item in info:
                text_id = item['id']
                item['id'] = str(item['id'])
                item['box_id'] = str(item['box_id'])
                # item['box_name'] = box_name_map.get(item['box_id'], '')
                icon_name = item['icon']
                item['icon'] = BASE_URL + icon_name
                item['icon_name'] = icon_name
                base_tools.trans_time(item, BoxList.DATETIME_KEY)
                detail = TextDetail.load_by_text_id(text_id)
                # item['content'] = detail.data.get('content') if detail.data else ''
                try:
                    content_str = detail.data.get('content') if detail.data else ''
                    content = base64.b64decode(content_str)
                except Exception:
                    log.warn(traceback.format_exc())
                    content = detail.data.get('content') if detail.data else ''
                item['content'] = content
        data['info'] = info
        return success(data=data)


class TextInfoViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('text_id', T_INT, False),
    ]

    _post_handler_fields = [
        Field('text_id', T_INT, False),
        Field('name', T_STR, False),
        Field('content', T_STR, True),
        Field('icon', T_STR, False),
        Field('available', T_INT, False),
        Field('save_type', T_INT, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        text_id = params.get('text_id')

        text = TextInfo(text_id)
        text.load()
        if not text.data:
            return error(errcode=RESP_CODE.DATAERR)
        save_type = text.data['save_type']
        if save_type == define.SAVE_TYPE_RICH:
            detail = TextDetail.load_by_text_id(text_id)
            # text.data['content'] = detail.data.get('content') if detail.data else ''
            try:
                content_str = detail.data.get('content') if detail.data else ''
                content = base64.b64decode(content_str)
            except Exception:
                log.warn(traceback.format_exc())
                content = detail.data.get('content') if detail.data else ''
            text.data['content'] = content
        else:
            text.data['content'] = ''
        data = text.data
        icon_name = data['icon']
        data['icon'] = BASE_URL + icon_name
        data['icon_name'] = icon_name
        return success(data=data)

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        content_str = ''
        params = self.validator.data
        save_type = params['save_type']
        content = params.pop('content')
        text_id = params.pop('text_id')

        text = TextInfo(text_id)
        text.load()
        if not text.data:
            return error(errcode=RESP_CODE.DATAERR)

        ret = text.update(params)
        log.debug('TextInfoViewHandler|post update info ret=%s', ret)
        if ret != 1:
            return error(errcode=RESP_CODE.DATAERR)

        if save_type == define.SAVE_TYPE_FILE:
            return success(data={})

        detail = TextDetail.load_by_text_id(text_id)
        detail_id = detail.data.get('id')
        log.debug('content=%s', content)
        if isinstance(content, list) and content:
            for item in content:
                content_str += item
        else:
            content_str = content
        detail_values = {
            #'content': content,
            'content': base64.b64encode(content_str)
        }
        d = TextDetail(detail_id)
        ret = d.update(detail_values)
        log.debug('TextInfoViewHandler|post update detail ret=%s', ret)
        return success(data={})


class TextInfoDeleteHandler(BaseHandler):

    _post_handler_fields = [
        Field('text_id', T_INT, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        text_id = params['text_id']
        text = TextInfo(text_id)
        text.load()
        if not text.data:
            return error(RESP_CODE.DATAERR)
        delete_values = {'available': define.TEXT_TITLE_DISABLE}
        ret = text.update(delete_values)
        if ret != 1:
            return error(RESP_CODE.DBERR)
        return success(data={})
