/**
 * Created by admin on 2018/5/10.
 */

$(document).ready(function () {

    $('#textList').DataTable({
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
            var $textList_length = $("#textList_length");
            var $textList_paginate = $("#textList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $textList_paginate.addClass('col-md-8');
            $textList_length.addClass('col-md-4');
            $textList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var name = $("#text_name").val();

            if(name){
                get_data.name = name;
            }

            var box_name = $("#box_name").val();
            if(box_name){
                get_data.box_name = box_name;
            }
            
            $.ajax({
                url: '/mis/v1/api/text/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#textList_processing");
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
                targets: 2,
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
                    var text_id = full.id;
                    var view ="<button type='button' class='btn btn-info btn-sm viewEdit' data-text_id="+text_id+">"+'查看'+"</button>";
                    var del ="<button type='button' class='btn btn-warning btn-sm deleteText' data-text_id="+text_id+">"+'删除'+"</button>";
                    return view + del;
                }
            }
        ],
        'columns': [
            { data: 'box_name'},
            { data: 'name'},
            { data: 'icon'},
            //{ data: 'content'},
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

    $(document).on('click', '.viewEdit', function(){
        $("label.error").remove();
        var se_userid = window.localStorage.getItem('myid');
        var text_id = $(this).data('text_id');
        $('#text_view').text(text_id);

        var get_data = {};
        get_data.se_userid = se_userid;
        get_data.text_id = text_id;

        $('#textViewForm').resetForm();

        $.ajax({
            url: '/mis/v1/api/text/view',
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
                    var save_type = text_data.save_type;
                    console.log("save_type ", save_type);
                    $("#save_type_view").val(save_type);
                    $('#text_name_view').val(text_data.name);
                    //$('#text_content_view').val(text_data.content);
                    if(save_type === 1){
                        console.log("rich");
                        $('#summernote').summernote('code', text_data.content);
                        $("#rich_text_view_div").show();
                        $("#file_view_div").hide();
                    } else {
                        console.log("file");
                        $("#rich_text_view_div").hide();
                        $("#file_view_div").show();
                        $('#text_name_view').attr("disabled", true);
                    }
                    $('#text_available_view').val(text_data.available);
                    $("#text_icon_url_view").attr('src', text_data.icon).show();
                    $('#text_icon_name_view').text(text_data.icon_name);
                    $('#textViewModal').modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $('#textViewSubmit').click(function () {
        var text_view_vt = $('#textViewForm').validate({
            rules: {
                text_name_view: {
                    required: true,
                    maxlength: 32
                },
                text_content_view: {
                    required: true,
                    maxlength: 500
                }
            },
            messages: {

                text_name_view: {
                    required: '请输入名称',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                },
                text_content_view: {
                    required: '请输入内容',
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

        var ok = text_view_vt.form();
        if(!ok){
            return false;
        }
        icon_src = $("#text_icon_url_view")[0].src;
        if(icon_src === "") {
            return false;
        }

        var se_userid = window.localStorage.getItem('myid');

        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.text_id = $('#text_view').text();
        post_data.name = $("#text_name_view").val();
        post_data.save_type = $("#save_type_view").val();
        //post_data.content = $('#text_content_view').val();
        if(post_data.save_type === "1"){
            post_data.content = $('#summernote').summernote('code');
        }
        post_data.available = $('#text_available_view').val();
        post_data.icon = $('#text_icon_name_view').text();

        $.ajax({
            url: '/mis/v1/api/text/view',
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
                    toastr.success('修改');
                    $("#textViewForm").resetForm();
                    $("#textViewModal").modal('hide');
                    $('#textList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });


    $(document).on('click', '.deleteText', function(){
        var se_userid = window.localStorage.getItem('myid');
        var text_id = $(this).data('text_id');
        var post_data = {};
        post_data.se_userid = se_userid;
        post_data.text_id = text_id;
        $.confirm({
            title: '请确认',
            content: '确认删除',
            type: 'blue',
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: '确认',
                    btnClass: 'btn-red',
                    action: function() {
                        console.log('do confirm delete');
			$.ajax({
			    url: '/mis/v1/api/text/disable',
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
				    toastr.success('删除成功');
				    $('#textList').DataTable().draw();
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
                        console.log('do cancel delete');
                    }
                }
            }
        });
    });

    $("#text_search").click(function(){

        var text_query_vt = $('#text_list_query').validate({
            rules: {
                text_name: {
                    required: false,
                    maxlength: 32
                }
            },
            messages: {
                text_name: {
                    required: '请输入名称'
                }
            },
            errorPlacement: function(error, element){
                var $error_element = element.parent().parent().next();
                $error_element.text('');
                error.appendTo($error_element);
            }
        });
        var ok = text_query_vt.form();
        if(!ok){
            $("#query_label_error").show();
            $("#query_label_error").fadeOut(1400);
            return false;
        }
        $('#textList').DataTable().draw();
    });

    $('#summernote').summernote({
        // minHeight: 320,
        minHeight: 420,
        // maxHeight: 320,
        minWidth: 512,
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
                        //设置到编辑器中
                        $('#summernote').summernote('insertImage',src,'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            }
        }
    });

    $('#summernote').on('summernote.change', function(we, contents, $editable) {
        var content = $('#summernote').summernote('code');
        $('#article_content').html(content);
        $('#article_content').show();
    });

    $("#save_type_view").change(function () {
        var save_type = $("#save_type_view").val();
        if(save_type === "1"){
            $("#file_view_div").hide();
            $("#rich_text_view_div").show();
            $('#text_name_view').attr("disabled", false);
        } else {
            $("#file_view_div").show();
            $("#rich_text_view_div").hide();
            $('#text_name_view').attr("disabled", true);
        }
    });

});

function upload_text_icon_view(obj) {
    var se_userid = window.localStorage.getItem('myid');
    var formData = new FormData();
    var name = $("#textIconViewUpload").val();
    formData.append("file", $("#textIconViewUpload")[0].files[0]);
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
            $("#text_icon_url_view").attr('src', src).show();
            $("#text_icon_name_view").text(name);
        },
        error: function (response) {
            console.log(response);
        }
    });
}

function upload_file(obj) {
    var se_userid = window.localStorage.getItem('myid');
    var formData = new FormData();
    /// var name = $("#file_add").val();
    var name = $("#file_view")[0].files[0].name;
    $("#text_name_view").val(name);

    formData.append("file", $("#file_view")[0].files[0]);
    formData.append("name", name);
    formData.append("se_userid", se_userid);
    $.ajax({
        url: "/mis/v1/api/file/upload",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function () {
            console.log("before file send ");
        },
        success: function (data) {
            console.log(data);
            toastr.success('文件上传成功');
        },
        error: function (response) {
            console.log(response);
            toastr.warning('文件上传错误');
        }
    });
}
