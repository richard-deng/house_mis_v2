/**
 * Created by admin on 2018/8/3.
 */

$(document).ready(function () {

    $('#carouselList').DataTable({
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
            var $carouselList_length = $("#carouselList_length");
            var $carouselList_paginate = $("#carouselList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $carouselList_paginate.addClass('col-md-8');
            $carouselList_length.addClass('col-md-4');
            $carouselList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var name = $("#carousel_name").val();

            if(name){
                get_data.name = name;
            }

            $.ajax({
                url: '/mis/v1/api/carousel/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#carouselList_processing");
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
                targets: 1,
                render: function (data, type, full) {
                    // return '<a href=' + data + '>' + data + '</a>';
                    return '<img src=' + data +  ' width="30px" height="30px"/>';
                }

            },
            {
                targets: 3,
                render: function (data, type, full) {
                    if (data === 1) {
                        return '启用'
                    } else {
                        return '关闭'
                    }
                }
            },
            {
                targets: 6,
                data: '操作',
                render: function(data, type, full) {
                    var carousel_id = full.id;
                    return "<button type='button' class='btn btn-info btn-sm viewEdit' data-carousel_id="+carousel_id+">"+'编辑'+"</button>";
                }
            }
        ],
        'columns': [
            { data: 'name'},
            { data: 'icon'},
            { data: 'priority'},
            { data: 'available'},
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

    $('#carousel_create').click(function(){
        $('#carouselCreateForm').resetForm();
        $("#carousel_icon_url_add").attr('src', '').hide();
        $("label.error").remove();
        $('#carouselCreateModal').modal();
    });

    $('#carouselCreateSubmit').click(function(){

        var carousel_create_vt = $('#carouselCreateForm').validate({
            rules: {
                carousel_name_add: {
                    required: true,
                    maxlength: 32
                },
                carousel_priority_add: {
                    required: false,
                    maxlength: 20,
                    digits: true
                }
            },
            messages: {

                carousel_name_add: {
                    required: '请输入名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                carousel_priority_add: {
                    required: '请输入优先级',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串"),
                    digits: '必须输入整数'
                }
            },
            errorPlacement: function(error, element){
                if(element.is(':checkcarousel')){
                    error.appendTo(element.parent().parent().parent());
                } else {
                    error.insertAfter(element);
                }
            }
        });

        var ok = carousel_create_vt.form();
        if(!ok){
            return false;
        }
        icon_src = $("#carousel_icon_url_add")[0].src;
        if(icon_src === "") {
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.name = $('#carousel_name_add').val();
        post_data.priority = $('#carousel_priority_add').val();
        post_data.available = $('#carousel_available_add').val();
        post_data.icon = $("#carousel_icon_name_add").text();

        $.ajax({
            url: '/mis/v1/api/carousel/create',
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
                    $("#carouselCreateForm").resetForm();
                    $("#carouselCreateModal").modal('hide');
                    $('#carouselList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $(document).on('click', '.viewEdit', function(){
        $("label.error").remove();
        var se_userid = window.localStorage.getItem('myid');
        var carousel_id = $(this).data('carousel_id');
        $('#view_carousel_id').text(carousel_id);

        var get_data = {};
        get_data.se_userid = se_userid;
        get_data.carousel_id = carousel_id;
        $('#carouselViewForm').resetForm();
        $.ajax({
            url: '/mis/v1/api/carousel/view',
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

                    $('#carousel_name_view').val(text_data.name);
                    $('#carousel_available_view').val(text_data.available);
                    $('#carousel_priority_view').val(text_data.priority);
                    $("#carousel_icon_url_view").attr('src', text_data.icon).show();
                    $('#carousel_icon_name_view').text(text_data.icon_name);
                    $('#carouselViewModal').modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $('#carouselViewSubmit').click(function(){
        var carousel_view_vt = $('#carouselViewForm').validate({
            rules: {
                carousel_name_view: {
                    required: true,
                    maxlength: 32
                },
                carousel_priority_view: {
                    required: false,
                    maxlength: 20,
                    digits: true
                }
            },
            messages: {
                carousel_name_view: {
                    required: '请输入名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                carousel_priority_view: {
                    required: '请输入优先级',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串"),
                    digits: '必须输入整数'
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

        var ok = carousel_view_vt.form();
        if(!ok){
            return false;
        }

        icon_src = $("#carousel_icon_url_view")[0].src;
        if(icon_src === "") {
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.name = $('#carousel_name_view').val();
        post_data.priority = $('#carousel_priority_view').val();
        post_data.available = $('#carousel_available_view').val();
        post_data.icon = $("#carousel_icon_name_view").text();
        post_data.carousel_id = $("#view_carousel_id").text();

        $.ajax({
            url: '/mis/v1/api/carousel/view',
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
                    toastr.success('保存修改成功');
                    $("#carouselViewForm").resetForm();
                    $("#carouselViewModal").modal('hide');
                    $('#carouselList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $("#carousel_search").click(function(){
        var carousel_query_vt = $('#carousel_list_query').validate({
            rules: {
                carousel_name: {
                    required: false,
                    maxlength: 32
                }
            },
            messages: {
                carousel_name: {
                    required: '请输入名称'
                }
            },
            errorPlacement: function(error, element){
                var $error_element = element.parent().parent().next();
                $error_element.text('');
                error.appendTo($error_element);
            }
        });
        var ok = carousel_query_vt.form();
        if(!ok){
            $("#query_label_error").show();
            $("#query_label_error").fadeOut(1400);
            return false;
        }
        $('#carouselList').DataTable().draw();
    });
});

function upload_file(obj) {
    var se_userid = window.localStorage.getItem('myid');
    var formData = new FormData();
    var name = $("#iconCreateUpload").val();
    formData.append("file", $("#iconCreateUpload")[0].files[0]);
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
            $("#carousel_icon_url_add").attr('src', src).show();
            $("#carousel_icon_name_add").text(name);
        },
        error: function (response) {
            console.log(response);
        }
    });
}

function upload_view_file(obj) {
    var se_userid = window.localStorage.getItem('myid');
    var formData = new FormData();
    var name = $("#iconViewUpload").val();
    formData.append("file", $("#iconViewUpload")[0].files[0]);
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
            $("#carousel_icon_url_view").attr('src', src).show();
            $("#carousel_icon_name_view").text(name);
        },
        error: function (response) {
            console.log(response);
        }
    });
}
