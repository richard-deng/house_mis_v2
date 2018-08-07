# coding: utf-8
import logging

from config import cookie_conf
from runtime import g_rt

from house_base.base_handler import BaseHandler
from house_base.trade import TradeOrder
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session
from house_base.tools import trans_amt

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()


class TradeOrderListHandler(BaseHandler):

    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('syssn', T_STR, True),
        Field('start_time', T_STR, True),
        Field('end_time', T_STR, True),
        Field('consumer_mobile', T_STR, True),
        Field('consumer_name', T_STR, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data ={}
        params = self.validator.data
        info, num = TradeOrder.page(**params)
        data['num'] = num
        data['info'] = info
        if data['info']:
            for record in data['info']:
                trans_amt(record)

        return success(data=data)

class TradeOrderViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('syssn', T_STR, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        syssn = params['syssn']
        trade = TradeOrder(syssn)
        if not trade.data:
            return error(RESP_CODE.DATAERR)
        return success(data=trade.data) 
