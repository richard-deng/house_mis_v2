/**
 * Created by admin on 2018/7/25.
 */
$(document).ready(function () {

    $('#questionList').DataTable({
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
            var $questionList_length = $("#questionList_length");
            var $questionList_paginate = $("#questionList_paginate");
            var $page_top = $('.top');

            $page_top.addClass('row');
            $questionList_paginate.addClass('col-md-8');
            $questionList_length.addClass('col-md-4');
            $questionList_length.prependTo($page_top);
        },
        "ajax": function(data, callback, settings){
            var se_userid = window.localStorage.getItem('myid');

            var get_data = {
                'page': Math.ceil(data.start / data.length) + 1,
                'maxnum': data.length,
                'se_userid': se_userid
            };

            var name = $("#question_name").val();
            var parent = $("#question_parent").text();

            if(name){
                get_data.name = name;
            }

            if(parent){
                get_data.parent = parent;
            }

            $.ajax({
                url: '/mis/v1/api/question/new/list',
                type: 'GET',
                dataType: 'json',
                data: get_data,
                success: function(data) {
                    var respcd = data.respcd;
                    if(respcd !== '0000'){
                        $processing = $("#questionList_processing");
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
                    var question_id = full.id;
                    var category = full.category;
                    var parent = full.parent;
                    var parent_parent = full.parent_parent;
                    var status = full.status;
                    var change_desc = status === 0 ? '关闭' : '启用';
                    var view ="<button type='button' class='btn btn-warning btn-sm viewEdit' data-question_id="+question_id+">"+'编辑'+"</button>";
                    var next ="<button type='button' class='btn btn-info btn-sm viewNext' data-current_id="+question_id+">"+'详情'+"</button>";
                    var up = "<button type='button' class='btn btn-success btn-sm viewUp' data-parent_parent=" + parent_parent + ">"+'上一层'+"</button>";
                    var add_answer ="<button type='button' class='btn btn-primary btn-sm addAnswer' data-parent_id="+question_id+">"+'添加答案'+"</button>";
                    var add_desc ="<button type='button' class='btn btn-primary btn-sm addDesc' data-current_id="+question_id+">"+'添加描述'+"</button>";
                    var add_question ="<button type='button' class='btn btn-primary btn-sm addQuestion' data-current_id="+question_id+">"+'添加问题'+"</button>";
                    var change_status ="<button type='button' class='btn btn-primary btn-sm changeStatus' data-current_id="+question_id+ " data-status="+ status +">"+change_desc+"</button>";
                    if(category != 2) {
                        // 非答案
                        if(parent != -1){
                            return view + next + up +add_answer + add_desc + add_question + change_status;
                        } else {
                            return view + next  +add_answer + add_desc + add_question + change_status;
                        }
                    } else {
                        // 答案
                        return view + up + change_status;
                    }
                }
            }
        ],
        'columns': [
            { data: 'name'},
            { data: 'category_desc'},
            { data: 'status_desc'},
            //{ data: 'parent'},
            { data: 'ctime'},
            //{ data: 'utime'}
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

    $('#question_root_create').click(function () {
        $('#addRootQuestionCreateForm').resetForm();
        $("label.error").remove();
        $('#addRootQuestionModal').modal();
    });

    $('#rootQuestionCreateSubmit').click(function () {
        var root_question_vt = $('#addRootQuestionCreateForm').validate({
            rules: {
                root_question_add: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                root_question_add: {
                    required: '请输入问题内容',
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
        var ok = root_question_vt.form();
        if(!ok){
            return false;
        }
        var name = $('#root_question_add').val();

        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.name = name;
        post_data.category = 1;
        post_data.parent = -1;

        $.ajax({
            url: '/mis/v1/api/question/create',
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
                    $('#addRootQuestionModal').modal('hide');
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $(document).on('click', '.viewEdit', function(){
        $("#renameForm").resetForm();
        $("label.error").remove();
        var question_id = $(this).data('question_id');
        $("#rename_question_id").text(question_id);

        var get_data = {};
        var se_userid = window.localStorage.getItem('myid');
        get_data.se_userid = se_userid;
        get_data.question_id = question_id;
        $.ajax({
            url: '/mis/v1/api/question/update',
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
                    var question = data.data;
                    $("#rename").val(question.name);
                    $("#renameModal").modal();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });


    });

    $('#renameSubmit').click(function () {
        var rename_content_vt = $('#renameForm').validate({
            rules: {
                rename: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                rename: {
                    required: '请输入修改内容',
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
        var ok = rename_content_vt.form();
        if(!ok){
            return false;
        }
        var name = $('#rename').val();
        var question_id = $('#rename_question_id').text();

        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.name = name;
        post_data.question_id = question_id;
        $.ajax({
            url: '/mis/v1/api/question/update',
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
                    $("#renameModal").modal('hide');
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $(document).on('click', '.addAnswer', function(){
        var parent_id = $(this).data('parent_id');
        $("#answer_parent").text(parent_id);
        $("#addAnswerCreateForm").resetForm();
        $("label.error").remove();
        $("#addAnswerModal").modal();
    });

    $(document).on('click', '.viewNext', function(){
        var current_id = $(this).data('current_id');
        $("#question_name").val('');
        $("#question_parent").text(current_id);
        $('#questionList').DataTable().draw();
    });

    $(document).on('click', '.viewUp', function(){
        var parent_parent = $(this).data('parent_parent');
        $("#question_name").val('');
        $("#question_parent").text(parent_parent);
        $('#questionList').DataTable().draw();
    });

    $(document).on('click', '.addDesc', function () {
        var current_id = $(this).data('current_id');
        $("#desc_parent").text(current_id);
        $("#addDescCreateForm").resetForm();
        $("label.error").remove();
        $("#addDescModal").modal();
    });

    $('#descCreateSubmit').click(function () {
        var desc_vt = $('#addDescCreateForm').validate({
            rules: {
                desc_add: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                desc_add: {
                    required: '请输入描述',
                    maxlength: $.validator.format("请输入一个 长度最多是 {0} 的字符串")
                }
            }
        });

        var ok = desc_vt.form();
        if(!ok){
            return false;
        }

        var description = $('#desc_add').val();
        var parent = $('#desc_parent').text();

        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');

        post_data.se_userid = se_userid;
        post_data.name = description;
        post_data.category = 3;
        post_data.parent = parent;

        $.ajax({
            url: '/mis/v1/api/question/create',
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
                    $('#addDescModal').modal('hide');
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $(document).on('click', '.addQuestion', function () {
        var parent = $(this).data('current_id');
        $("#normal_question_parent").text(parent);
        $("#addQuestionCreateForm").resetForm();
        $("label.error").remove();
        $("#addQuestionModal").modal();
    });

    $('#questionCreateSubmit').click(function () {
        var question_vt = $('#addQuestionCreateForm').validate({
            rules: {
                question_add: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                question_add: {
                    required: '请输入问题内容',
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
        var ok = question_vt.form();
        if(!ok){
            return false;
        }

        var parent = $('#normal_question_parent').text();
        var question = $('#question_add').val();
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');

        post_data.se_userid = se_userid;
        post_data.name = question;
        post_data.category = 1;
        post_data.parent = parent;

        $.ajax({
            url: '/mis/v1/api/question/create',
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
                    $("#addQuestionModal").modal('hide');
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

    $('#answerCreateSubmit').click(function () {

        var answer_vt = $('#addAnswerCreateForm').validate({
            rules: {
                answer_add: {
                    required: true,
                    maxlength: 200
                }
            },
            messages: {
                answer_add: {
                    required: '请输入答案',
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
        var ok = answer_vt.form();
        if(!ok){
            return false;
        }

        var answer = $('#answer_add').val();
        var parent = $('#answer_parent').text();
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');

        post_data.se_userid = se_userid;
        post_data.name = answer;
        post_data.category = 2;
        post_data.parent = parent;

        $.ajax({
            url: '/mis/v1/api/question/create',
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
                    $("#addAnswerModal").modal('hide');
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });

    });

    $(document).on('click', '.changeStatus', function () {
        var current_id = $(this).data('current_id');
        var status = $(this).data('status');

        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.status = status === 0 ? 1: 0;
        post_data.question_id = current_id;

        $.ajax({
            url: '/mis/v1/api/question/update',
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
                    $('#questionList').DataTable().draw();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    });

});