# coding: utf-8
import logging

from config import cookie_conf
from runtime import g_rt

from house_base.base_handler import BaseHandler
from house_base.rate import RateInfo
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR, T_FLOAT,
)

log = logging.getLogger()

class RateListHandler(BaseHandler):

    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('name', T_STR, True),
    ]
    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data = {}
        params = self.validator.data
        info, num = RateInfo.page(**params)
        data['num'] = num
        if info:
            data['info'] = info
        else:
            data['info'] = []
        return success(data=data)


class RateAddHandler(BaseHandler):

    _post_handler_fields = [
        Field('name', T_STR, False),
        Field('rate', T_FLOAT, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        data = {}
        params = self.validator.data
        # 先检查是否有同名的数据存在
        rate = RateInfo.load_by_name(params.get('name'))
        if rate.data:
            return error(RESP_CODE.DATAEXIST)
        ret = RateInfo.create(params)
        if ret != 1:
            return error(RESP_CODE.DATAERR)
        return success(data=data)


class RateViewHandler(BaseHandler):

    _post_handler_fields = [
        Field('rate_id', T_INT, False),
        Field('rate', T_FLOAT, False)
    ]

    _get_handler_fields = [
        Field('rate_id', T_INT, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        data = {}
        params = self.validator.data
        rate_id = params.pop('rate_id')
        rate = RateInfo(rate_id)
        rate.load()
        if not rate.data:
            return error(RESP_CODE.DATAERR)
        ret = rate.update(params)
        if ret != 1:
            return error(RESP_CODE.DATAERR)
        return success(data=data)

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        rate_id = params.get('rate_id')
        rate = RateInfo(rate_id)
        rate.load()
        if not rate.data:
            return error(RESP_CODE.DATAERR)
        return success(data=rate.data)

