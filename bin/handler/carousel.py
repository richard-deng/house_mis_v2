# coding: utf-8
import logging

from config import cookie_conf
from config import BASE_URL
from runtime import g_rt
from house_base.carousel import Carousel
from house_base import tools as base_tools
from house_base.base_handler import BaseHandler
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()


class CarouselListHandler(BaseHandler):

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
        info, num = Carousel.page(**params)
        data['num'] = num
        if info:
            for item in info:
                item['id'] = str(item['id'])
                icon_name = item['icon']
                item['icon'] = BASE_URL + icon_name
                item['icon_name'] = icon_name
                base_tools.trans_time(item, Carousel.DATETIME_KEY)
        data['info'] = info
        return success(data=data)


class CarouselCreateHandler(BaseHandler):

    _post_handler_fields = [
        Field('name', T_STR, False),
        Field('available', T_INT, False),
        Field('priority', T_INT, False),
        Field('icon', T_STR, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        # 检查名称
        ret = Carousel.create(params)
        log.debug("class=%s|create ret=%s", self.__class__.__name__, ret)
        if ret != 1:
            return error(errcode=RESP_CODE.DATAERR)
        return success(data={})


class CarouselViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('carousel_id', T_INT, False)
    ]

    _post_handler_fields = [
        Field('carousel_id', T_INT, False),
        Field('name', T_STR, False),
        Field('available', T_INT, False),
        Field('priority', T_INT, False),
        Field('icon', T_STR, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        carousel_id = params.get('carousel_id')
        carousel = Carousel(carousel_id)
        carousel.load()
        data = carousel.data
        icon_name = data['icon']
        data['icon'] = BASE_URL + icon_name
        data['icon_name'] = icon_name
        log.debug('class=%s|get|data=%s', self.__class__.__name__, data)
        return success(data=data)

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        carousel_id = params.pop('carousel_id')
        # 检查是否存在
        carousel = Carousel(carousel_id)
        carousel.load()
        if not carousel.data:
            return error(errcode=RESP_CODE.DATAERR)
        ret = carousel.update(params)
        log.debug('class=%s|post|update ret=%s', self.__class__.__name__, ret)
        return success(data={})
