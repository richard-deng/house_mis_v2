/**
 * Created by admin on 2018/6/15.
 */
$(document).ready(function () {
    //get_tree();
    var img_src_prefix = 'http://mis.xunchengfangfu.com';
    var default_parent = -1;
    var se_userid = window.localStorage.getItem('myid');
    var question_url = '/mis/v1/api/question/list?se_userid=' + se_userid;
    $('#container').jstree({
        'core' : {
            'multiple': false,		//单选
            'themes': {
                // "dots" : true      //用点连接层次
                "stripes": true
            },
            'check_callback': true, // 允许所有修改
            /*
            'data' : [{
                "id" : -1,
                "text" : "Root node",
                "icon" : "glyphicon glyphicon-question-sign",
                "children" : [
                    {
                        "id" : 1,
                        "text" : "Child node 1",
                        "icon" : "glyphicon glyphicon-question-sign",
                        "category" : "question"
                    },
                    {
                        "id" : 2,
                        "text" : "Child node 2",
                        "icon" : "glyphicon glyphicon-question-sign",
                        "category" : "question"
                    }
                ]
            }]
            */
            /* load all
            'data': {
                // "url": "/mis/v1/api/question/list?se_userid=1",
                "url": question_url,
                "dataType": "json"
            }
            */
            'data': {
                'url': '/mis/v1/api/question/lazy/load',
                'dataType': 'json',
                'data': function (node) {
                    if(node.id !== '#'){
                        default_parent = node.id;
                    }
                    return {
                        'se_userid': se_userid,
                        'parent': default_parent
                    }
                },
                success: function () {
                    console.log('success');
                }
            }
        },
        //"plugins" : ["dnd", "contextmenu", "changed", "types"],
        "plugins" : ["changed", "types", "contextmenu"],
        "contextmenu":{
            "items":{
                "添加":{
                    "label": "添加",
                    "icon": "glyphicon glyphicon-plus",
                    "action": function(data){
                        var inst = $.jstree.reference(data.reference);
                        var obj = inst.get_node(data.reference);
                        var parent = obj.id;
                        console.log('obj=', obj);
                        parent_category = obj.original.category;
                        save_type = obj.original.save_type;
                        if(save_type == 2){
                            toastr.warning('富文本叶子节点不能再添加');
                            return false;
                        }
                        var title = parent_category == 2 ? '问题' : '答案';
                        $("#normal_question_title").text(title);
                        $("#normal_question_parent").text(parent);
                        $("#normal_question_category").text(obj.original.category);
                        $('#addQuestionCreateForm').resetForm();
                        $("label.error").remove();
                        // 添加时默认的是普通文本
                        $('#rich_text_add_div').hide();
                        if(obj.original.category === 2){
                            $('#save_type_add').attr("disabled", true);
                            $('#normal_text_add_div').show();
                        }

                        $("#addQuestionModal").modal();
                        /*
                        inst.create_node(obj, {}, "last", function (new_node) {
                            console.log('new_node=', new_node);
                            var parent = new_node.parent;
                            $("#normal_question_parent").text(parent);
                            $("#normal_question_category").text(obj.original.category);
                            $('#addQuestionCreateForm').resetForm();
                            $("label.error").remove();
                            $("#addQuestionModal").modal();
                        });
                        */
                    }
                },
                "修改":{
                    "separator_before"  : false,
                    "separator_after"   : false,
                    "_disabled"         : false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
                    "label"             : "修改",
                    "shortcut_label"    : 'F2',
                    "icon"              : "glyphicon glyphicon-leaf",
                    "action"            : function (data) {
                        var inst = $.jstree.reference(data.reference);
                        var obj = inst.get_node(data.reference);
                        console.log('modify obj:', obj);
                        var question_id = obj.id;
                        $("#modify_question_id").text(question_id);
                        var save_type = obj.original.save_type;
                        $('#modify_save_type').text(save_type);
                        $('#renameForm').resetForm();
                        $("label.error").remove();
                        if(save_type === 1) {
                            var text = obj.text;
                            $("#rename").val(text);
                            $("#rename_view_div").show();
                            $("#rich_text_view_div").hide();
                        } else {
                            var content = obj.original.content;
                            $("#summernote_view").summernote('code', content);
                            $("#rename_view_div").hide();
                            $("#rich_text_view_div").show();
                        } 

                        $('#renameModal').modal();
                    }
                },
                "删除":{
                    "separator_before"  : false,
                    //"icon"              : false,
                    "separator_after"   : false,
                    "_disabled"         : false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
                    "label"             : "删除",
                    "icon"              :"glyphicon glyphicon-remove",
                    "action"            : function (data) {
                        var inst = $.jstree.reference(data.reference);
                        var obj = inst.get_node(data.reference);
                        console.log('obj=', obj);
                        var question_id = obj.id;
                        $.confirm({
                            title: '请确认',
                            content: '确认删除？',
                            type: 'blue',
                            typeAnimated: true,
                            buttons: {
                                confirm: {
                                    text: '确认',
                                    btnClass: 'btn-red',
                                    action: function() {
                                        disable_node(question_id, 1);
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
                        /*
                        if(inst.is_selected(obj)) {
                            inst.delete_node(inst.get_selected());
                        }
                        else {
                            inst.delete_node(obj);
                        }
                        */
                    }
                }
            }
        }
    });

    /*
    $('#container').on("changed.jstree", function (e, data) {
        console.log(data.selected);
        console.log(data.changed.selected);	// newly selected
        console.log(data.changed.deselected); // newly deselected

    });
    */

    $('#select_one').on("click", function () {
        var instance = $('#container').jstree(true);
        instance.deselect_all();
        instance.select_node('-1');
    });

    $('#do_add_root_question').click(function () {
        $('#addRootQuestionCreateForm').resetForm();
        $("label.error").remove();
        $('#addRootQuestionModal').modal();
        /*
        var root_question = window.prompt('请输入根问题');
        if(root_question){
            var root_id = -1;
            create_node(root_id, root_question, 1);
            window.location.reload();
        }
        */
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
        var root_question = $('#root_question_add').val();
        if(root_question){
            var root_id = -1;
            var save_type = 1;
            var category = 1;
            create_node(root_id, root_question, category, save_type);
            $('#addRootQuestionModal').modal('hide');
            window.location.reload();
        }
    });

    $('#do_add_question').click(function(){

        console.log('add question');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        var psel = ref.get_parent(sel);
        var parent = psel[0];
        console.log('selected ', sel);
        var sel_id = sel[0];
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        var category = obj.original.category;
        console.log('category: ', category);
        if (category === 2){
            //window.alert('答案不能再添加');
            toastr.warning('答案不能再添加');
            return;
        }

        /*
        var question = window.prompt('请输入问题');
        if(question){
            create_node(sel_id, question, 1);
        }
        */

        $('#addQuestionCreateForm').resetForm();
        $("label.error").remove();
        $('#addQuestionModal').modal();
    });

    /*
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

        console.log('add question');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        var psel = ref.get_parent(sel);
        var parent = psel[0];
        console.log('selected ', sel);
        var sel_id = sel[0];
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        var category = obj.original.category;
        console.log('category: ', category);
        if (category === 2){
            //window.alert('答案不能再添加');
            toastr.warning('答案不能再添加');
            return;
        }
        var question = $('#question_add').val();
        if(question){
            create_node(sel_id, question, 1);
            $('#addQuestionModal').modal('hide');
        }
    });
    */
    $('#questionCreateSubmit').click(function () {
        var content = '';
        var name = '';
        var save_type = $('#save_type_add').val();
        var category = $('#normal_question_category').text();
        if(save_type === "1") {
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
            name = $('#question_add').val();
        } else {
            name = '点击修改查看详情';
            content = $('#summernote').summernote('code');
            if(!content){
                toastr.warning("请填写富文本内容");
                return false;
            }
        }

        var parent = $('#normal_question_parent').text();
        var new_category = category === '1' ? 2: 1;
        console.log('category=', category, 'new_category=', new_category, 'save_type=', save_type);
        create_node(parent, name, new_category, save_type, content);
        $('#addQuestionModal').modal('hide');
    });

    $('#do_add_answer').click(function(){

        console.log('add answer');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        var sel_id = sel[0];
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        var category = obj.original.category;
        console.log('category: ', category);
        if (category === 2){
            //window.alert('答案不能再添加');
            toastr.warning('答案不能再添加');
            return;
        }

        $('#addAnswerCreateForm').resetForm();
        $("label.error").remove();
        $('#addAnswerModal').modal();

        /*
        var answer = window.prompt('请输入答案');
        if(answer){
            create_node(sel_id, answer, 2);
        }
        */
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

        console.log('add answer');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        var sel_id = sel[0];
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        var category = obj.original.category;
        console.log('category: ', category);
        if (category === 2){
            //window.alert('答案不能再添加');
            toastr.warning('答案不能再添加');
            return;
        }
        if(answer){
            create_node(sel_id, answer, 2);
            $('#addAnswerModal').modal('hide');
        }
    });

    $('#do_rename').click(function(){

        /*
        console.log('rename');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        var content = window.prompt('请输入修改的内容');
        if(content){
            var question_id = sel[0];
            update_node(question_id, content);
        }
        */

        $('#renameForm').resetForm();
        $("label.error").remove();
        $('#renameModal').modal();

    });

    /*
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
        var content = $('#rename').val();
        console.log('rename');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        if(content){
            var question_id = sel[0];
            update_node(question_id, content);
            $('#renameModal').modal('hide');
        }
    });
    */
    $('#renameSubmit').click(function () {
        var name = '';
        var content = '';
        var save_type = $("#modify_save_type").text();
        console.log('save_type: ', save_type);
        if(save_type === '1') {
            console.log('1');
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
            name = $('#rename').val();
        } else {
            console.log('2');
            content = $("#summernote_view").summernote('code'); 
        }
        var question_id = $('#modify_question_id').text();
        update_node(question_id, name, content);
        $('#renameModal').modal('hide');
    });

    $('#do_delete').click(function(){
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        var sel_id = sel[0];
        disable_node(sel_id, 1);
        /*
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        if(inst.is_selected(obj)) {
            inst.delete_node(inst.get_selected());
        }
        else {
            inst.delete_node(obj);
        }
        */
    });

    $('#do_add_desc').click(function () {
        console.log('add desc');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        var psel = ref.get_parent(sel);
        var parent = psel[0];
        console.log('selected ', sel);
        var sel_id = sel[0];
        var inst = $.jstree.reference(sel_id);
        var obj = inst.get_node(sel_id);
        var category = obj.original.category;
        console.log('category: ', category);
        if (category !== 1){
            //window.alert('答案不能再添加');
            toastr.warning('只有问题才能添加描述');
            return;
        }

        $('#addDescCreateForm').resetForm();
        $("label.error").remove();
        $('#addDescModal').modal();
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
        console.log('do add desc');
        var ref = $('#container').jstree(true);
        var sel = ref.get_selected();
        console.log('selected ', sel);
        var sel_id = sel[0];
        create_node(sel_id, description, 3);
        $('#addDescModal').modal('hide');
    });

    $('#save_type_add').change(function () {
        var current_category = $('#normal_question_category').text();
        // 在答案(2)下添加问题是只有文本
        // 在问题(1)下添加答案可以有富文本
        var save_type = $('#save_type_add').val();
        if(current_category === "1"){
            // 问题
            if(save_type === "1"){
                // 1是普通文本
                $('#rich_text_add_div').hide();
                $('#normal_text_add_div').show();
            } else {
                // 2是富文本
                $('#normal_text_add_div').hide();
                $('#rich_text_add_div').show();
            }
        } else {
            // 答案下
            $('#rich_text_add_div').hide();
            $('#normal_text_add_div').show();

        }

    });

    $('#summernote').summernote({
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
                        // $('#summernote').summernote('insertImage',src,'img');
                        $('#summernote').summernote('insertImage', full_src, 'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            }
        }
    });


    $('#summernote_view').summernote({
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
                        $('#summernote_view').summernote('insertImage', full_src, 'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            }
        }
    });


    function create_node(sel_id, name, category, save_type, content='') {
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.name = name;
        post_data.category = category;
        post_data.parent = sel_id;
        post_data.save_type = save_type;
        post_data.content = content;
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
                    var inst = $.jstree.reference(sel_id);
                    var obj = inst.get_node(sel_id);
                    inst.create_node(obj, {}, "last", function (new_node) {
                        try {
                            new_node.text=name;
                            new_node.icon="glyphicon glyphicon-question-sign";
                            new_node.category="1";
                            inst.edit(new_node);
                            console.log('create question finish');
                        } catch (ex) {
                            setTimeout(function () { inst.edit(new_node); },0);
                        }
                    });
                    default_parent = -1;
                    var ref = $('#container').jstree(true);
                    ref.refresh();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    }

    function update_node(question_id, name='', content='') {
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.question_id = question_id;
        if(name){
            post_data.name = name;
        }
        if(content){
            post_data.content = content;
        }

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
                    //ref.set_text(sel, content);
                    default_parent = -1;
                    var ref = $('#container').jstree(true);
                    ref.refresh();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    }

    function disable_node(question_id, status) {
        var post_data = {};
        var se_userid = window.localStorage.getItem('myid');
        post_data.se_userid = se_userid;
        post_data.status = status;
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
                    var ref = $('#container').jstree(true);
                    ref.refresh();
                }
            },
            error: function(data) {
                toastr.warning('请求异常');
            }
        });
    }
});
