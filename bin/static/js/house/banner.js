$(document).ready(function(){

    var img_src_prefix = 'http://mis.xunchengfangfu.com';

    $('#bannerList').DataTable({
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
            var $bannerList_length = $("#bannerList_length");
            var $bannerList_paginate = $("#bannerList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $bannerList_paginate.addClass('col-md-8');
            $bannerList_length.addClass('col-md-4');
            $bannerList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var title = $("#banner_title").val();

            if(title){
                get_data.title = title;
            }

            $.ajax({
                url: '/mis/v1/api/banner/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#bannerList_processing");
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
                    console.log('data=', data, data === '0');
                    if (data === 0) {
                        return '启用'
                    } else {
                        return '关闭'
                    }
                }
            },
            {
                targets: 4,
                data: '操作',
                render: function(data, type, full) {
                    var msg = '';
                    var new_status = '';
                    var banner_id = full.id;
                    var status = full.status;
                    if(status === 0){
                        msg = '关闭';
                        new_status = 1;
                    } else {
                        msg = '打开';
                        new_status = 0;
                    }
                    var view = "<button type='button' class='btn btn-info btn-sm viewEdit' data-banner_id="+banner_id+">"+'编辑'+"</button>";
                    var del ="<button type='button' class='btn btn-warning btn-sm deleteBanner' data-banner_id="+banner_id+ ' data-new_status='+ new_status +">"+msg+"</button>";
                    return view + del;
                }
            }
        ],
        'columns': [
            { data: 'title'},
            { data: 'status'},
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

    $(document).on('click', '.deleteBanner', function () {
        var banner_id = $(this).data('banner_id');
        var new_status = $(this).data('new_status');
        $.confirm({
            title: '请确认',
            content: '确认删除？',
            type: 'blue',
            typeAnimated: false,
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'btn-red',
                    action: function() {
                        console.log('delete');
                        var se_userid = window.localStorage.getItem('myid');
                        var post_data = {};
                        post_data.se_userid = se_userid;
                        post_data.status = new_status;
                        post_data.banner_id = banner_id;
                        $.ajax({
                            url: '/mis/v1/api/banner/state/change',
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
                                    toastr.success('操作成功');
                                    $('#bannerList').DataTable().draw();
                                }
                            },
                            error: function(data) {
                                toastr.warning('请求异常');
                            }
                        });
                    }
                },
                cancel: {
                    text: '取消',
                    action: function() {
                        console.log('clicked cancel');
                    }
                }
            }
        });
    });

    $(document).on('click', '.viewEdit', function(){
        var banner_id = $(this).data('banner_id');
        $('#view_banner_id').text(banner_id);
        $('#bannerViewForm').resetForm();
        $("label.error").remove();

        var se_userid = window.localStorage.getItem('myid');
        var get_data = {};
        get_data.se_userid = se_userid;
        get_data.banner_id = banner_id;
        $.ajax({
            url: '/mis/v1/api/banner/view',
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
                } else {
                    detail_data = data.data;
                    title = detail_data.title;
                    content = detail_data.content;
                    $('#banner_title_view').val(title);
                    $('#content_view').summernote('code', content);
                    $('#bannerViewModal').modal();
                }
            },
            error: function(data) {
                toastr.warning('请求数据异常');
            }

        });

    });

    $('#bannerViewSubmit').click(function () {
        var banner_view_vt = $('#bannerViewForm').validate({
            rules: {
                banner_title_view: {
                    required: true,
                    maxlength: 32
                }
            },
            messages: {
                banner_title_view: {
                    required: '请输入标题',
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

        var ok = banner_view_vt.form();
        if(!ok){
            return false;
        }
        var banner_id = $('#view_banner_id').text();
        var title = $('#banner_title_view').val();
        var content = $('#content_view').summernote('code');
        if(!content){
            toastr.warning('请输入内容');
            return false;
        }
        var se_userid = window.localStorage.getItem('myid');
        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.content = content;
        post_data.title = title;
        post_data.banner_id = banner_id;

        $.ajax({
            url: '/mis/v1/api/banner/view',
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
                    $("#bannerViewForm").resetForm();
                    $("#bannerViewModal").modal('hide');
                    $('#bannerList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $('#content_view').summernote({
        minHeight: 420,
        // maxHeight: 320,
        // minWidth: 512,
        // maxWidth: 512,
        focus: true,
        lang: 'zh-CN',
        dialogsInBody: true,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['insert', ['picture', 'link']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ],
        callbacks: {
            onImageUpload: function(files) {
                //由于summernote上传图片上传的是二进制数据
                //所以这里可以自己重新上传图片方法
                var formData = new FormData();
                var name = files[0]['name'];
                console.log('name:', name);
                formData.append('file',files[0]);
                formData.append("name", name);
                $.ajax({
                    url : '/mis/v1/api/icon/upload', //后台文件上传接口
                    type : 'POST',
                    data : formData,
                    processData : false,
                    contentType : false,
                    success : function(data) {
                        console.log('data:', data);
                        detail_data = data.data;
                        src = detail_data.icon_url;
                        full_src = img_src_prefix + src;
                        //设置到编辑器中
                        // $('#summernote_view').summernote('insertImage',src,'img');
                        $('#content_view').summernote('insertImage', full_src, 'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            }
        }
    });

    $('#content_create').summernote({
        minHeight: 420,
        // maxHeight: 320,
        // minWidth: 512,
        // maxWidth: 512,
        focus: true,
        lang: 'zh-CN',
        dialogsInBody: true,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['insert', ['picture', 'link']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ],
        callbacks: {
            onImageUpload: function(files) {
                //由于summernote上传图片上传的是二进制数据
                //所以这里可以自己重新上传图片方法
                var formData = new FormData();
                var name = files[0]['name'];
                console.log('name:', name);
                formData.append('file',files[0]);
                formData.append("name", name);
                $.ajax({
                    url : '/mis/v1/api/icon/upload', //后台文件上传接口
                    type : 'POST',
                    data : formData,
                    processData : false,
                    contentType : false,
                    success : function(data) {
                        console.log('data:', data);
                        detail_data = data.data;
                        src = detail_data.icon_url;
                        full_src = img_src_prefix + src;
                        //设置到编辑器中
                        // $('#summernote_view').summernote('insertImage',src,'img');
                        $('#content_create').summernote('insertImage', full_src, 'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            }
        }
    });

    $('#banner_create').click(function () {
        $('#bannerCreateForm').resetForm();
        $("label.error").remove();
        $('#bannerCreateModal').modal();
    });

    $('#bannerCreateSubmit').click(function () {
        var banner_create_vt = $('#bannerCreateForm').validate({
            rules: {
                banner_title_create: {
                    required: true,
                    maxlength: 32
                }
            },
            messages: {
                banner_title_create: {
                    required: '请输入标题',
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

        var ok = banner_create_vt.form();
        if(!ok){
            return false;
        }

        var title = $('#banner_title_create').val();
        var content = $('#content_create').summernote('code');
        if(!content){
            toastr.warning('请填写内容');
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');
        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.content = content;
        post_data.title = title;

        $.ajax({
            url: '/mis/v1/api/banner/create',
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
                    $("#bannerCreateForm").resetForm();
                    $("#bannerCreateModal").modal('hide');
                    $('#bannerList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });


    $("#banner_search").click(function(){
        var banner_query_vt = $('#banner_list_query').validate({
            rules: {
                banner_title: {
                    required: false,
                    maxlength: 32
                }
            },
            messages: {
                banner_title: {
                    required: '请输入标题'
                }
            },
            errorPlacement: function(error, element){
                var $error_element = element.parent().parent().next();
                $error_element.text('');
                error.appendTo($error_element);
            }
        });
        var ok = banner_query_vt.form();
        if(!ok){
            $("#query_label_error").show();
            $("#query_label_error").fadeOut(1400);
            return false;
        }
        $('#bannerList').DataTable().draw();
    });


});
