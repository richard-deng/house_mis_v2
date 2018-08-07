/**
 * Created by admin on 2018/5/10.
 */
$(document).ready(function () {

    $('#orderList').DataTable({
        "autoWidth": false,     //通常被禁用作为优化
        "processing": true,
        "serverSide": true,
        "paging": true,         //制指定它才能显示表格底部的分页按钮
        "info": true,
        "ordering": false,
        "searching": false,
        "lengthChange": true,
        "deferRender": true,
        "iDisplayLength": 10,
        "sPaginationType": "full_numbers",
        "lengthMenu": [[10, 40, 100],[10, 40, 100]],
        "dom": 'l<"top"p>rt',
        "fnInitComplete": function(){
            var $orderList_length = $("#orderList_length");
            var $orderList_paginate = $("#orderList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $orderList_paginate.addClass('col-md-8');
            $orderList_length.addClass('col-md-4');
            $orderList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var goods_name = $("#goods_name").val();

            if(goods_name){
                get_data.goods_name = goods_name;
            }

            $.ajax({
                url: '/mis/v1/api/order/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#orderList_processing");
                        $processing.css('display', 'none');
                        var resperr = data.resperr;
                        var respmsg = data.respmsg;
                        var msg = resperr ? resperr : respmsg;
                        toastr.warning(msg);
                        return false;
                    } else {
                        detail_data = data.data;
                        num = detail_data.num;
                        callback({
                            recordsTotal: num,
                            recordsFiltered: num,
                            data: detail_data.info
                        });
                    }
                },
                error: function(data) {
                    toastr.warning('请求数据异常');
                }

            });
        },
        'columnDefs': [
            {
                targets: 4,
                render: function (data, type, full) {
                    return '<a href=' + data + '>' + data + '</a>';
                }

            },
            {
                targets: 7,
                data: '操作',
                render: function(data, type, full) {
                    var order_id = full.id;
                    var view ="<button type='button' class='btn btn-warning btn-sm viewEdit' data-order_id="+order_id+">"+'查看'+"</button>";
                    return view;
                }
            }
        ],
        'columns': [
            { data: 'box_name'},
            { data: 'goods_name'},
            { data: 'goods_price'},
            { data: 'goods_desc'},
            { data: 'goods_picture'},
            { data: 'ctime'},
            { data: 'utime'}
        ],
        'oLanguage': {
            'sProcessing': '<span style="color:red;">加载中....</span>',
            'sLengthMenu': '每页显示_MENU_条记录',
            "sInfo": '显示 _START_到_END_ 的 _TOTAL_条数据',
            'sInfoEmpty': '没有匹配的数据',
            'sZeroRecords': '没有找到匹配的数据',
            'oPaginate': {
                'sFirst': '首页',
                'sPrevious': '前一页',
                'sNext': '后一页',
                'sLast': '尾页'
            }
        }
    });

    $(document).on('click', '.viewEdit', function(){
        $("label.error").remove();
        var se_userid = window.localStorage.getItem('myid');
        var order_id = $(this).data('order_id');
        $('#order_view').text(order_id);

        var get_data = {};
        get_data.se_userid = se_userid;
        get_data.order_id = order_id;

        $('#orderViewForm').resetForm();

        $.ajax({
            url: '/mis/v1/api/order/view',
            type: 'GET',
            dataType: 'json',
            data: get_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd !== '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                    return false;
                }
                else {
                    text_data = data.data;

                    $('#goods_name_view').val(text_data.goods_name);
                    $('#goods_price_view').val(text_data.goods_price);
                    $('#goods_desc_view').val(text_data.goods_desc);
                    $("#goods_picture_url_view").attr('src', text_data.goods_picture).show();
                    $('#goods_picture_name_view').text(text_data.goods_picture_name);
                    $('#orderViewModal').modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $('#orderViewSubmit').click(function(){
        var order_view_vt = $('#orderViewForm').validate({
            rules: {
                goods_name_view: {
                    required: true,
                    maxlength: 32
                },
                goods_price_view: {
                    required: false,
                    maxlength: 20,
                    digits: true
                },
                goods_desc_view: {
                    required: true,
                    maxlength: 1024
                }
            },
            messages: {

                goods_name_view: {
                    required: '请输入商品名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                goods_price_view: {
                    required: '请输入商品价格',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串"),
                    digits: '必须输入整数'
                },
                goods_desc_view: {
                    required: '请输入商品名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                }
            },
            errorPlacement: function(error, element){
                if(element.is(':checkbox')){
                    error.appendTo(element.parent().parent().parent());
                } else {
                    error.insertAfter(element);
                }
            }
        });

        var ok = order_view_vt.form();
        if(!ok){
            return false;
        }
        picture_src = $("#goods_picture_url_view")[0].src;
        if(picture_src === "") {
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.order_id = $('#order_view').text();
        post_data.goods_name = $("#goods_name_view").val();
        post_data.goods_price = $('#goods_price_view').val();
        post_data.goods_desc = $('#goods_desc_view').val();
        post_data.goods_picture = $('#goods_picture_name_view').text();

        $.ajax({
            url: '/mis/v1/api/order/view',
            type: 'POST',
            dataType: 'json',
            data: post_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd !== '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                    return false;
                }
                else {
                    toastr.success('修改成功');
                    $("#orderViewForm").resetForm();
                    $("#orderViewModal").modal('hide');
                    $('#orderList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $("#order_search").click(function(){

        var order_query_vt = $('#order_list_query').validate({
            rules: {
                goods_name: {
                    required: false,
                    maxlength: 32
                }
            },
            messages: {
                goods_name: {
                    required: '请输入商品名称'
                }
            },
            errorPlacement: function(error, element){
                var $error_element = element.parent().parent().next();
                $error_element.text('');
                error.appendTo($error_element);
            }
        });
        var ok = order_query_vt.form();
        if(!ok){
            $("#query_label_error").show();
            $("#query_label_error").fadeOut(1400);
            return false;
        }
        $('#orderList').DataTable().draw();
    });

});

function upload_goods_picture_view(obj) {
    var se_userid = window.localStorage.getItem('myid');
    var formData = new FormData();
    var name = $("#goodsPictureViewUpload").val();
    formData.append("file", $("#goodsPictureViewUpload")[0].files[0]);
    formData.append("name", name);
    formData.append("se_userid", se_userid);
    $.ajax({
        url: "/mis/v1/api/icon/upload",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function () {
            console.log("before send ");
        },
        success: function (data) {
            console.log(data);
            detail_data = data.data;
            src = detail_data.icon_url;
            name = detail_data.icon_name;
            $("#goods_picture_url_view").attr('src', src).show();
            $("#goods_picture_name_view").text(name);
        },
        error: function (response) {
            console.log(response);
        }
    });
}
