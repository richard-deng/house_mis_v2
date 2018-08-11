# -*- coding: utf-8 -*-
import os
HOME = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'bin')
rtenv = 'product'

LOGFILE = {
    'root': {
        'filename': {
            'DEBUG': os.path.join(HOME, '../log/house_mis.log'),
            'ERROR': os.path.join(HOME, '../log/house_mis.error.log'),
        }
    }
}
# LOGFILE = None

database = {
    'house_core':{
        'engine': 'pymysql',
        'passwd': '123456',
        'charset': 'utf8',
        'db': 'house_core',
        'idle_timeout': 10,
        'host': '127.0.0.1',
        'user': 'xuncheng',
        'port': 3306,
        'conn': 15
    },

}



# web config
# URLS配置
URLS = None
# 静态路径配置
STATICS = {'/mis/static/':'/static/'}
# 模板配置
TEMPLATE = {
    'cache': True,
    'path': '',
    'tmp': os.path.join(HOME, '../tmp'),
}
# 中间件
MIDDLEWARE = ()
# WEB根路径
DOCUMENT_ROOT = HOME
# 页面编码
CHARSET = 'UTF-8'
# APP就是一个子目录
APPS = ()
DATABASE = {}
# 调试模式: True/False
# 生产环境必须为False
DEBUG = True
# 模版路径
template = os.path.join(HOME, 'template')

# 服务地址
HOST = '0.0.0.0'
# 服务端口
PORT = 8083
#redis
redis_url = 'redis://127.0.0.1:6379/0'
#用户注册状态
REGISTER_STATE = 4
#注册激活
DEFAULT_ACTIVE = 1
# 终端绑定默认2
TERMBIND_STATE = 2
#允许登录的手机号
ALLOW_LOGIN_MOBILE = ['13802438716', '13802438718']
#允许添加用户的账号
ALLOW_ADD_USER_ID = [1]
#cookie 配置
# cookie_conf = { 'expires':60*60*24*3, 'max_age':60*60*24*3, 'domain':'192.168.0.103', 'path':'/posp'}
cookie_conf = { 'expires':60*60*24*3, 'max_age':60*60*24*3, 'domain':'mis.xunchengfangfu.com', 'path':'/mis'}
# 上传的文件存放位置
SAVE_PATH = '/home/xunchengfangfu/house/house_mis_v2/bin/static/upload/icon/'
# 上传的文件存储位置
FILE_SAVE_PATH = '/home/xunchengfangfu/house/house_mis_v2/bin/static/upload/file/'
# 
TAIL_PATH = '/mis/static/upload/icon/'
# 链接前缀
# BASE_URL = 'http://' + cookie_conf.get('domain') + ':' + str(PORT) + TAIL_PATH
BASE_URL = 'http://' + cookie_conf.get('domain') + TAIL_PATH

# 退款需要的参数
API_KEY = ''
APPID = ''
MCH_ID = ''
SECRET = ''
# 协议文件
AGREEMENT = '/home/xunchengfangfu/house/house_mis_v2/data/agreement.html'
# 滚动文字文案
BANNER_TEXT = '/home/xunchengfangfu/house/house_mis_v2/data/banner.txt'
