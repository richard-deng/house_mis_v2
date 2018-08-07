# coding: utf-8
from zbase.web import core
from zbase.web import template
from house_base.session import house_check_session_for_page
from config import cookie_conf
from runtime import g_rt

import logging

log = logging.getLogger()


class Root(core.Handler):
    def GET(self):
        self.redirect('/mis/v1/page/login.html')

class Login(core.Handler):
    def GET(self):
        self.write(template.render('login.html'))

class BoxList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('box_list.html'))

class OrderList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('order.html'))

class TextList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('text.html'))

class UserList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('user.html'))

class TestSummerNote(core.Handler):
    def GET(self):
        self.write(template.render('test_summernote.html'))

class QuestionList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('questions.html'))

class QuestionNewList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('questions_new.html'))

class RateList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('rate.html'))

class TradeList(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('trade_order.html'))

class Agreement(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('agreement.html'))

class Carousel(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('carousel.html'))

class Banner(core.Handler):
    @house_check_session_for_page(g_rt.redis_pool, cookie_conf)
    def GET(self):
        self.write(template.render('banner.html'))
