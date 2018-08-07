# coding: utf-8
import logging
import base64

from config import BANNER_TEXT
from config import cookie_conf
from runtime import g_rt
from house_base.base_handler import BaseHandler
from house_base.banner import Banners
from house_base.tools import trans_time
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()

class BannerListHandler(BaseHandler):

    _get_handler_fields =[
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('title', T_STR, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data = {}
        params = self.validator.data
        info, num = Banners.page(**params)
        data['num'] = num
        if info:
            for record in info:
                record['id'] = str(record['id'])
                trans_time(record, Banners.DATETIME_KEY)
                record['content'] = base64.b64decode(record['content']) if record['content'] else ''

        data['info'] = info
        return success(data=data)


class BannerViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('banner_id', T_INT, False)
    ]

    _post_handler_fields = [
        Field('banner_id', T_INT, False),
        Field('title', T_STR, False),
        Field('content', T_STR, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        banner_id = params['banner_id']
        banner = Banners(banner_id)
        if not banner.data:
            return error(RESP_CODE.DATAERR)
        content = banner.data['content']
        banner.data['content'] = base64.b64decode(content)
        return success(data=banner.data)

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        banner_id = params.pop('banner_id')
        banner = Banners(banner_id)
        content = params['content']
        params['content'] = base64.b64encode(content)
        ret = banner.update(params)
        if ret != 1:
            return error(RESP_CODE.DATAERR)
        return success(data={})


class BannerCreateHandler(BaseHandler):

    _post_handler_fields = [
        Field('title', T_STR, False),
        Field('content', T_STR, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        title = params['title']
        banner = Banners.load_by_title(title)
        if banner:
            return error(RESP_CODE.DATAERR)
        content = params['content']
        params['content'] = base64.b64encode(content)
        ret = Banners.create(params)
        if ret != 1:
            return error(RESP_CODE.DATAERR)
        return success(data={})


class BannerStatusChangeHandler(BaseHandler):

    _post_handler_fields = [
        Field('banner_id', T_INT, False),
        Field('status', T_INT, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        banner_id = params['banner_id']
        status = params['status']
        banner = Banners(banner_id)
        if not banner.data:
            return error(RESP_CODE.DATAERR)
        values = {'status': status}
        ret = banner.update(values=values)
        if ret != 1:
            return error(RESP_CODE.DATAERR)
        return success(data={})