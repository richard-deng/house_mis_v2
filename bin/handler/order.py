# coding: utf-8
import logging

from config import cookie_conf
from config import BASE_URL
from runtime import g_rt
from house_base import tools as base_tools
from house_base.base_handler import BaseHandler
from house_base.box_list import BoxList
from house_base.order import Order
from house_base.response import success, error, RESP_CODE
from house_base.session import house_check_session

from zbase.web.validator import (
    with_validator_self, Field, T_INT, T_STR
)

log = logging.getLogger()


class OrderCreateHandler(BaseHandler):

    _post_handler_fields = [
        Field('box_id', T_INT, False),
        Field('goods_name', T_STR, False),
        Field('goods_price', T_INT, False),
        Field('goods_desc', T_STR, False),
        Field('goods_picture', T_STR, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        box_id = params.get('box_id')
        box = BoxList(box_id)
        box.load()
        if not box.data:
            return error(errcode=RESP_CODE.DATAERR)
        # 检查名称
        # 只能创建一个先检查
        order = Order.load_by_box_id(box_id)
        if order.data:
            return error(errcode=RESP_CODE.DATAEXIST)
        ret = Order.create(params)
        log.debug('class=OrderCreateHandler|create ret=%s', ret)
        if ret != 1:
            return error(errcode=RESP_CODE.DATAERR)
        return success(data={})


class OrderListHandler(BaseHandler):
    _get_handler_fields = [
        Field('page', T_INT, False),
        Field('maxnum', T_INT, False),
        Field('goods_name', T_STR, True),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        data = {}

        params = self.validator.data
        info, num = Order.page(**params)
        data['num'] = num
        if info:
            boxs = BoxList.load_all(where={})
            box_name_map = {}
            for box in boxs:
                box_name_map[box['id']] = box['name']
            for item in info:
                item['id'] = str(item['id'])
                item['box_id'] = str(item['box_id'])
                item['box_name'] = box_name_map.get(item['box_id'], '')
                goods_picture = item['goods_picture']
                item['goods_picture'] = BASE_URL + goods_picture
                item['goods_picture_name'] = goods_picture
                base_tools.trans_time(item, BoxList.DATETIME_KEY)
        data['info'] = info
        return success(data=data)


class OrderViewHandler(BaseHandler):

    _get_handler_fields = [
        Field('order_id', T_INT, False),
    ]

    _post_handler_fields = [
        Field('order_id', T_INT, False),
        Field('goods_name', T_STR, False),
        Field('goods_price', T_INT, False),
        Field('goods_desc', T_STR, False),
        Field('goods_picture', T_STR, False),
    ]

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _get_handler(self):
        params = self.validator.data
        order_id = params.get('order_id')
        order = Order(order_id)
        order.load()
        data = order.data
        goods_picture_name = data['goods_picture']
        data['goods_picture'] = BASE_URL + goods_picture_name
        data['goods_picture_name'] = goods_picture_name
        log.debug('OrderViewHandler|get|data=%s', data)
        return success(data=data)

    @house_check_session(g_rt.redis_pool, cookie_conf)
    @with_validator_self
    def _post_handler(self):
        params = self.validator.data
        order_id = params.pop('order_id')
        order = Order(order_id)
        order.load()
        if not order.data:
            return error(errcode=RESP_CODE.DATAERR)
        # 检查名称
        ret = order.update(params)
        log.debug('OrderViewHandler|post|update ret=%s', ret)
        if ret != 1:
            return error(errcode=RESP_CODE.DATAERR)
        return success(data={})

