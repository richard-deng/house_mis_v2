# coding: utf-8
import logging
import json

import config
from config import cookie_conf
from runtime import g_rt

from house_base.base_handler import BaseHandler
from house_base.weixin import Refund, RefundQuery
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session
from house_base import define
import tools

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()


class RefundHandler(BaseHandler):

    _post_handler_fields = [
        Field('syssn', T_STR, False),
        Field('txamt', T_INT, False)
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        data = {}
        params = self.validator.data
        syssn = params['syssn']
        txamt = params['txamt']
        r = Refund(config.APPID, config.SECRET, config.MCH_ID, config.API_KEY)
        flag, msg = r.run(syssn, txamt)
        if not flag:
            return error(RESP_CODE.UNKOWNERR, respmsg=msg)
        return success(data=data)
