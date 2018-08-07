#coding:utf-8
import datetime
import logging

try:
    import simplejson as json
except ImportError:
    import json

log = logging.getLogger()

class POSPRET:
    OK                    = "0000"
    DBERR                 = "2000"
    THIRDERR              = "2001"
    SESSIONERR            = "2002"
    DATAERR               = "2003"
    IOERR                 = "2004"
    LOGINERR              = "2100"
    PARAMERR              = "2101"
    USERERR               = "2102"
    ROLEERR               = "2103"
    PWDERR                = "2104"
    USERNOTEXISTS         = "2105"
    REQERR                = "2200"
    IPERR                 = "2201"
    NODATA                = "2300"
    DATAEXIST             = "2301"
    PHONENUMEXIST         = "2302"
    UNKOWNERR             = "2400"
    SERVERERR             = "2600"
    METHODERR             = "2601"


error_map = {
    POSPRET.OK                    : u"成功",
    POSPRET.DBERR                 : u"数据库查询错误",
    POSPRET.THIRDERR              : u"第三方系统错误",
    POSPRET.SESSIONERR            : u"用户未登录",
    POSPRET.DATAERR               : u"数据错误",
    POSPRET.IOERR                 : u"文件读写错误",
    POSPRET.LOGINERR              : u"用户登录失败",
    POSPRET.PARAMERR              : u"参数错误",
    POSPRET.USERERR               : u"用户不存在或未激活",
    POSPRET.ROLEERR               : u"用户身份错误",
    POSPRET.PWDERR                : u"密码错误",
    POSPRET.REQERR                : u"非法请求或请求次数受限",
    POSPRET.IPERR                 : u"IP受限",
    POSPRET.NODATA                : u"无数据",
    POSPRET.DATAEXIST             : u"数据已存在",
    POSPRET.UNKOWNERR             : u"未知错误",
    POSPRET.SERVERERR             : u"内部错误",
    POSPRET.METHODERR             : u"函数未实现",
}

def json_default_trans(obj):
    '''json对处理不了的格式的处理方法'''
    if isinstance(obj, datetime.datetime):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    if isinstance(obj, datetime.date):
        return obj.strftime('%Y-%m-%d')
    raise TypeError('%r is not JSON serializable' % obj)


def error(errcode, resperr='', respmsg='', data=None, debug=False, escape=True, encoder=None):
    global error_map
    if not resperr:
        resperr = respmsg if respmsg else error_map[errcode]
    if not data:
        data = {}
    ret = {"respcd": errcode, "respmsg": respmsg, "resperr": resperr, "data": data}
    if debug:
        log.debug('error:%s', ret)
    return json.dumps(ret, ensure_ascii=escape, cls=encoder, separators=(',', ':'), default = json_default_trans)

def success(data, resperr='', debug=False, escape=True, encoder=None):
    ret = {"respcd": "0000", "resperr": resperr, "respmsg": "", "data": data}
    if debug:
        log.debug('success:%s', ret)
    return json.dumps(ret, ensure_ascii=escape, cls=encoder, separators=(',', ':'), default = json_default_trans)
