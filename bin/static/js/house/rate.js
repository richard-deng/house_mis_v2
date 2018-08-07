/**
 * Created by admin on 2018/6/28.
 */

$(document).ready(function () {

    $.validator.addMethod("isValidRate", function(value, element) {
        var data = /^[0-9]+(.[0-9]{1,3})?$/;
        return this.optional(element) || (data.test(value));
    }, "请正确填写利率");

    $('#rateList').DataTable({
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
            var $rateList_length = $("#rateList_length");
            var $rateList_paginate = $("#rateList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $rateList_paginate.addClass('col-md-8');
            $rateList_length.addClass('col-md-4');
            $rateList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var name = $("#rate_name").val();

            if(name){
                get_data.name = name;
            }

            $.ajax({
                url: '/mis/v1/api/rate/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#rateList_processing");
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
                data: '操作',
                render: function(data, type, full) {
                    var rate_id = full.id;
                    var view ="<button type='button' class='btn btn-warning btn-sm viewEdit' data-rate_id="+rate_id+">"+'查看'+"</button>";
                    return view;
                }
            }
        ],
        'columns': [
            { data: 'name'},
            { data: 'rate'},
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

    $("#rate_search").click(function(){

        var rate_query_vt = $('#rate_list_query').validate({
            rules: {
                rate_name: {
                    required: false,
                    maxlength: 32
                }
            },
            messages: {
                rate_name: {
                    required: '请输入名称'
                }
            },
            errorPlacement: function(error, element){
                var $error_element = element.parent().parent().next();
                $error_element.rate('');
                error.appendTo($error_element);
            }
        });
        var ok = rate_query_vt.form();
        if(!ok){
            $("#query_label_error").show();
            $("#query_label_error").fadeOut(1400);
            return false;
        }
        $('#rateList').DataTable().draw();
    });

    $(document).on('click', '.viewEdit', function(){
        $("label.error").remove();
        var se_userid = window.localStorage.getItem('myid');
        var rate_id = $(this).data('rate_id');
        $('#view_rate_id').text(rate_id);

        var get_data = {};
        get_data.se_userid = se_userid;
        get_data.rate_id = rate_id;

        $('#rateViewForm').resetForm();

        $.ajax({
            url: '/mis/v1/api/rate/view',
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
                    rate_data = data.data;

                    $('#name_view').val(rate_data.name);
                    $('#rate_view').val(rate_data.rate);
                    $('#rateViewModal').modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $('#rateViewSubmit').click(function () {
        var rate_view_vt = $('#rateViewForm').validate({
            rules: {
                rate_view: {
                    required: true,
                    isValidRate: '#rate_view'
                }
            },
            messages: {
                rate_view: {
                    required: '请输入利率'
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

        var ok = rate_view_vt.form();
        if(!ok){
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.rate_id = $('#view_rate_id').text();
        post_data.rate = $('#rate_view').val();

        $.ajax({
            url: '/mis/v1/api/rate/view',
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
                    $("#rateViewForm").resetForm();
                    $("#rateViewModal").modal('hide');
                    $('#rateList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $('#rate_add').click(function () {
        $('#rateCreateForm').resetForm();
        $("label.error").remove();
        $('#rateCreateModal').modal();
    });

    $('#rateCreateSubmit').click(function () {
        var rate_create_vt = $('#rateCreateForm').validate({
           rules: {
               name_create: {
                   required: true,
                   maxlength: 30
               },
               rate_create: {
                   required: true,
                   isValidRate: '#rate_create'
               }
           },
           messages: {
               name_create: {
                   required: '请输入名称',
                   maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
               },
               rate_create: {
                   required: '请输入利率'
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

        var ok = rate_create_vt.form();
        if (!ok) {
            return false;
        }
        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.name = $('#name_create').val();
        post_data.rate = $('#rate_create').val();


        $.ajax({
            url: '/mis/v1/api/rate/create',
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
                    toastr.success('添加成功');
                    $("#rateCreateForm").resetForm();
                    $("#rateCreateModal").modal('hide');
                    $('#rateList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

});