# -*- coding: utf-8 -*-
import hashlib
import logging
import datetime
from constant import INVALID_VALUE
from house_base.define import TOKEN_HOUSE_CORE
from house_base.user import User, gen_passwd
from house_base.profile import Profile
from zbase.base.dbpool import get_connection_exception
from zbase.web.validator import T_INT

from config import (
    REGISTER_STATE, DEFAULT_ACTIVE,
)
log = logging.getLogger()


def trans_datetime(date_value):
    date_str = datetime.datetime.strftime(date_value, '%Y-%m-%d %H:%M:%S')
    return date_str

def gen_now_str():
    now = datetime.datetime.now()
    now_str = now.strftime('%Y%m%d%H%M%S')
    return now_str

def get_merchant(user_id):
    func = 'get_merchant'
    log.debug('func=%s|user_id=%s', func, user_id)
    on = {'auth_user.id': 'profile.userid'}
    where = {'auth_user.id': user_id}
    keep_fields = [
        'auth_user.id', 'auth_user.mobile', 'auth_user.state', 'auth_user.email',
        'auth_user.is_active', 'profile.province', 'profile.city', 'profile.nickname',
        'profile.name', 'profile.idnumber', 'auth_user.user_type'
    ]
    log.debug('yy')
    log.debug('token=%s', TOKEN_HOUSE_CORE)
    with get_connection_exception(TOKEN_HOUSE_CORE) as conn:
        log.debug('xx')
        ret = conn.select_join_one(table1='auth_user', table2='profile', fields=keep_fields, on=on, where=where)
        log.debug('func=%s|user_id=%s|ret=%s', func, user_id, ret)
        return ret

def update_merchant(user_id, values):
    func = 'update_merchant'
    log.debug('func=%s|user_id=%s|values=%s', func, user_id, values)

    user_value = {}
    profile_value = {}

    for key, value in values.iteritems():
        if value not in INVALID_VALUE:
            if key in User.KEYS:
                user_value[key] = value
            if key in Profile.KEYS:
                profile_value[key] = value
        else:
            log.debug('ingore key=%s', key)

    log.debug('user_value=%s|profile_value=%s', user_value, profile_value)
    if user_value:
        user = User(user_id)
        user.update(user_value)

    if profile_value:
        profile = Profile(user_id)
        profile.update(profile_value)

def build_profile(values):
    # 添加其它数据
    func = 'build_profile'
    log.debug('func=%s|input=%s', func, values)

    profile = {}
    now = datetime.datetime.now()

    for key in Profile.KEYS:
        value = values.get(key)
        if key in Profile.MUST_KEY.keys():
            if value not in INVALID_VALUE:
                profile[key] = value
            else:
                if Profile.MUST_KEY.get(key) == T_INT:
                    profile[key] = 0
                else:
                    profile[key] = ''

        if key in Profile.OPTION_KEY.keys():
            if value not in INVALID_VALUE:
                profile[key] = value

        for key in Profile.DATETIME_KEY.keys():
            if Profile.DATETIME_KEY.get(key) == 'date':
                profile[key] = now.strftime('%Y-%m-%d')
            if Profile.DATETIME_KEY.get(key) == 'datetime':
                profile[key] = now.strftime('%Y-%m-%d %H:%M:%S')

    log.debug('func=%s|output=%s', func, profile)
    return profile

def build_user(values):
    func='build_user'
    log.debug('func=%s|input=%s', func, values)
    user = {}
    now = datetime.datetime.now()

    for key in User.KEYS:
        value = values.get(key)
        if key in User.MUST_KEY.keys():
            if value not in INVALID_VALUE:
                user[key] = value
            else:
                if User.MUST_KEY.get(key) == T_INT:
                    user[key] = 0
                else:
                    user[key] = ''

        if key in User.OPTION_KEY.keys():
            if value not in INVALID_VALUE:
                user[key] = value

        for key in User.DATETIME_KEY.keys():
            if User.DATETIME_KEY.get(key) == 'date':
                user[key] = now.strftime('%Y-%m-%d')
            if User.DATETIME_KEY.get(key) == 'datetime':
                user[key] = now.strftime('%Y-%m-%d %H:%M:%S')

    user['state'] = REGISTER_STATE
    user['is_active'] = DEFAULT_ACTIVE
    # password = values.get('mobile')[-6:]
    password = values['password']
    h = hashlib.md5(password)
    md5_password = h.hexdigest()
    log.info('md5_password=%s', md5_password)
    user['password'] = gen_passwd(md5_password)
    log.debug('func=%s|output=%s', func, user)
    return user

def create_merchant(values):
    profile = build_profile(values)
    user = build_user(values)
    flag, userid = User.create(user, profile)
    return flag, userid


def find_parent_parent(current_parents):
    result = {}
    with get_connection_exception(TOKEN_HOUSE_CORE) as conn:
        records = conn.select(table='box_list', where={'id': ('in', list(set(current_parents)))})
        if records:
            for record in records:
                result[record['id']] = record['parent']
        log.debug('func=find_parent_parent|result=%s', result)
        return result
