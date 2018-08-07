# coding: utf-8

from handler import (
    ping,
    page,
    login,
    box_list,
    order,
    text,
    user,
    rate,
    questions,
    weixin,
    trade_order,
    agreement,
    carousel,
    banner,
)

urls = (
    # 接口
    ('^/ping$', ping.Ping),
    ('^/mis/v1/api/login$', login.LoginHandler),
    ('^/mis/v1/api/logout$', login.LogoutHandler),

    # 用户
    ('^/mis/v1/api/user/list$', user.UserListHandler),
    ('^/mis/v1/api/user/create$', user.UserCreateHandler),
    ('^/mis/v1/api/user/view$', user.UserViewHandler),
    ('^/mis/v1/api/user/state$', user.UserStateChangeHandler),
    ('^/mis/v1/api/user/password/change$', user.UserPasswordChange),

    # 九宫格
    ('^/mis/v1/api/box/list$', box_list.BoxListHandler),
    ('^/mis/v1/api/box/create$', box_list.BoxCreateHandler),
    ('^/mis/v1/api/box/view$', box_list.BoxViewHandler),
    ('^/mis/v1/api/icon/upload$', box_list.UploadIconHandler),
    ('^/mis/v1/api/file/upload$', box_list.FileUploadHandler),

    # 订单
    ('^/mis/v1/api/order/list$', order.OrderListHandler),
    ('^/mis/v1/api/order/view$', order.OrderViewHandler),
    ('^/mis/v1/api/order/create$', order.OrderCreateHandler),

    # 文本
    ('^/mis/v1/api/text/list$', text.TextInfoListHandler),
    ('^/mis/v1/api/text/view$', text.TextInfoViewHandler),
    ('^/mis/v1/api/text/create$', text.TextInfoCreateHandler),
    ('^/mis/v1/api/text/disable$', text.TextInfoDeleteHandler),

    # 问答
    ('^/mis/v1/api/question/list$', questions.QuestionsListHandler),
    ('^/mis/v1/api/question/new/list$', questions.QuestionsNewListHandler),
    ('^/mis/v1/api/question/create$', questions.QuestionAddHandler),
    ('^/mis/v1/api/question/update$', questions.QuestionViewHandler),
    ('^/mis/v1/api/question/lazy/load$', questions.QuestionsLazyLoadHandler),

    # 利率
    ('^/mis/v1/api/rate/list$', rate.RateListHandler),
    ('^/mis/v1/api/rate/create$', rate.RateAddHandler),
    ('^/mis/v1/api/rate/view$', rate.RateViewHandler),

    # 退款
    ('^/mis/v1/api/weixin/refund$', weixin.RefundHandler),

    # 交易流水
    ('^/mis/v1/api/trade/list$', trade_order.TradeOrderListHandler),
    ('^/mis/v1/api/trade/view$', trade_order.TradeOrderViewHandler),

    # 协议
    ('^/mis/v1/api/agreement/view$', agreement.AgreementViewHandler),

    # 横幅
    ('^/mis/v1/api/banner/list$', banner.BannerListHandler),
    ('^/mis/v1/api/banner/view$', banner.BannerViewHandler),
    ('^/mis/v1/api/banner/create$', banner.BannerCreateHandler),
    ('^/mis/v1/api/banner/state/change$', banner.BannerStatusChangeHandler),

    # 轮播
    ('^/mis/v1/api/carousel/list$', carousel.CarouselListHandler),
    ('^/mis/v1/api/carousel/view$', carousel.CarouselViewHandler),
    ('^/mis/v1/api/carousel/create$', carousel.CarouselCreateHandler),

    # 页面
    ('^/$', page.Root),
    ('^/mis/v1/page/login.html$', page.Login),
    ('^/mis/v1/page/user_list.html$', page.UserList),
    ('^/mis/v1/page/box_list.html$', page.BoxList),
    ('^/mis/v1/page/order_list.html$', page.OrderList),
    ('^/mis/v1/page/text_list.html$', page.TextList),
    ('^/mis/v1/page/question_list.html$', page.QuestionList),
    ('^/mis/v1/page/question/new/list.html$', page.QuestionNewList),
    ('^/mis/v1/page/rate_list.html$', page.RateList),
    ('^/mis/v1/page/trade_list.html$', page.TradeList),
    ('^/mis/v1/page/agreement.html$', page.Agreement),
    ('^/mis/v1/page/carousel_list.html$', page.Carousel),
    ('^/mis/v1/page/banner.html$', page.Banner),

    # 测试summernote文件上传
    ('^/mis/v1/page/test_summernote.html$', page.TestSummerNote),

)
