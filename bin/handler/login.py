# coding: utf-8
import logging

from config import ALLOW_LOGIN_MOBILE
from config import cookie_conf
from runtime import g_rt

from house_base.base_handler import BaseHandler
from house_base.define import HOUSE_USER_STATE_OK
from house_base.define import HOUSE_USER_TYPE_ADMIN 
from house_base.response import error, success, RESP_CODE
from house_base.session import house_check_session
from house_base.session import house_set_cookie
from house_base.user import User
from house_base.user import check_password
from zbase.web.validator import (
    with_validator_self, Field, T_REG, T_STR
)

log = logging.getLogger()


class LoginHandler(BaseHandler):

    _post_handler_fields = [
        Field('mobile', T_REG, False, match=r'^(1\d{10})$'),
        Field('password', T_STR, False),
    ]

    @house_set_cookie(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        mobile = params['mobile']
        password = params["password"]
        # if mobile not in ALLOW_LOGIN_MOBILE:
        #     log.info('mobile=%s forbidden', mobile)
        #     return error(RESP_CODE.USERFORBIDDEN)
        user = User.load_user_by_mobile(mobile)
        if user.data and user.userid:
            if user.data['state'] != HOUSE_USER_STATE_OK:
                log.info('userid=%s|state=%s|forbidden login', user.userid, user.data['state'])
                return error(RESP_CODE.USERSTATEERR)
            if user.data['user_type'] != HOUSE_USER_TYPE_ADMIN:
                log.info('userid=%s|user_type=%s|forbidden login', user.userid, user.data['user_type'])
                return error(RESP_CODE.ROLEERR)
            flag = check_password(password, user.data.get('password'))
            if not flag:
                return error(RESP_CODE.PWDERR)
            return success(data={'userid': user.userid})
        return error(RESP_CODE.DATAERR)


class LogoutHandler(BaseHandler):

    @house_check_session(g_rt.redis_pool, cookie_conf)
    def _get_handler(self):
        self.session.rm_session()
        self.resp.del_cookie('sessionid')
        return success(RESP_CODE.OK)
