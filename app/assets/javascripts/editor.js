var ce6 = ce6 || {};
ce6.editor = {
    nicConfig: {
        iconsPath: "/assets/nicEditorIcons.gif",
        buttonList: ["bold", "italic", "underline", "forecolor", "left", "center", "right", "justify", "ol", "ul", "fontSize", "upload"]
    },
    newEditorInstance: function (a, b, c) {
        allConf = this.nicConfig;
        for (var d in b) allConf[d] = b[d];
        (new nicEditor(allConf)).panelInstance(a);
        ce6.editor.editorSelector = a;
        $("#upload-attach").dialog(ce6.editor.uploadImgDialog).restyleButtons();
        $("#insert-img-tabs").tabs({
            show: function () {
                ce6.editor.uploadImgDialog.open()
            }
        });
        $("#web-img-preview").click(ce6.editor.imgReferCallback);
        $("#web-img-url").live("keyup", ce6.editor.imgReferCallback);
        $("#web-img-url").live("blur", ce6.editor.imgReferCallback);
        $(".nicEdit-panel").css({
            "margin-left": "137px"
        });
        $(".nicEdit-selectTxt").css({
            "margin-top": "0",
            height: "16px"
        });
        c && c(contestEditoor)
    },
    currentEditorInstance: function () {
        if (!ce6.editor.editorSelector) return {
            getContent: function () {
                return ""
            }
        };
        return nicEditors.findEditor(ce6.editor.editorSelector)
    },
    getPlainContent: function () {
        return this.currentEditorInstance().getContent().replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
    },
    getPlainContentLength: function () {
        return $.trim(this.getPlainContent()).length + this.getContentImgSrc().length
    },
    imgUploadCallback: function (a) {
        $("#user-photo-loader").addClass("hidden");
        $("#upload_msg").hide();
        $("#uploadForm").show();
        if (a.err) {
            $("#editor-uploaded-img-pre").removeClass("hidden");
            $("#upload_msg").text("*Upload failed, please try again.").show()
        } else {
            $("#user-photo-loader").addClass("hidden");
            $("#editor-uploaded-img-pre").removeClass("hidden").children("#editor-uploaded-img").attr("src", a.url);
            $("#editor-uploaded-img-pre").removeClass("hidden").children("#editor-uploaded-img").attr("src-decoed", a.decoed_url)
        }
    },
    imgReferCallback: function () {
        imgUrl = $("#web-img-url").val();
        if (!(imgUrl == "" || imgUrl == "http://")) {
            $("#editor-web-img-pre").children("#editor-web-img").attr("src", imgUrl);
            $("#editor-web-img-pre").children("#editor-web-img").attr("src-decoed", imgUrl)
        }
    },
    insertImage: function () {
        tabImg = $("#insert-img-tabs-1").is(":visible") ? $("#editor-uploaded-img") : $("#editor-web-img");
        ce6.editor.selectedInstance.savedSel = ce6.editor.savedSel;
        ce6.editor.selectedInstance.restoreRng();
        tmp = "javascript:tempImg()";
        ce6.editor.selectedInstance.nicCommand("insertImage", tmp);
        img = ce6.editor.selectedInstance.findElm("IMG", "src", tmp);
        tagA = (new bkElement("A")).appendBefore(img);
        tagSpan = (new bkElement("SPAN")).appendBefore(tagA);
        tagSpan.setContent("&nbsp;");
        img.appendTo(tagA);
        tagA.setAttributes({
            href: tabImg.attr("src"),
            target: "_blank"
        });
        img.setAttributes({
            src: tabImg.attr("src"),
            alt: "Loading image..."
        });
        tagA.appendBefore(tagSpan);
        $(".nicEdit-main").trigger("keyup", null)
    },
    insertImageUrl: function (a) {
        $(".nicEdit-main").focus().click();
        var b = ce6.editor.currentEditorInstance();
        b.nicCommand("insertImage", a);
        b = b.findElm("IMG", "src", a);
        if (!b) return false;
        var c = (new bkElement("A")).appendBefore(b),
            d = (new bkElement("SPAN")).appendBefore(c);
        d.setContent("&nbsp;");
        b.appendTo(c);
        c.setAttributes({
            href: a,
            target: "_blank"
        });
        b.setAttributes({
            src: a,
            alt: "Loading image..."
        });
        c.appendBefore(d);
        $(".nicEdit-main").trigger("keyup", null);
        return true
    },
    doUploadImg: function (a) {
        $("#upload-attach").next(".ui-dialog-buttonpane").children().children("button:last").disableButton();
        $("#editor-uploaded-img-pre").addClass("hidden");
        var b = $(a).val().match(/\.(png|jpg|jpeg|gif|tiff)$/i);
        if (b && b.length > 0 && b[1]) {
            a.form.submit();
            $("#uploadForm").hide();
            $("#user-photo-loader").removeClass("hidden");
            return false
        } else $("#upload_msg").text("*That file type is not supported").show()
    },
    openImageDlg: function () {
        editorContent = ce6.editor.currentEditorInstance().getContent();
        (allImgTags = editorContent.match(/<img.[^<>]*?>/gi)) && allImgTags.length >= editor_img_limit ? ce6.notifyBar("You could insert " + editor_img_limit + " images at most now.", "error") : $("#upload-attach").dialog("open")
    },
    presubmit: function () {
        editorContent = ce6.editor.currentEditorInstance().getContent();
        if ((allImgTags = editorContent.match(/<img.[^<>]*?>/gi)) && allImgTags.length > editor_img_limit) {
            ce6.notifyBar("You could insert " + editor_img_limit + " images at most now.", "error");
            return false
        }
        return true
    },
    getContentImgSrc: function () {
        imgList = [];
        $(".nicEdit-main img").each(function () {
            imgList.push($(this).attr("src"))
        });
        return imgList
    },
    getContentWithAutoLink: function (a) {
        filteredContent = this.currentEditorInstance().getContent();
        htmlTags = filteredContent.match(/<.[^<>]*?>/gi) || [];
        for (var b = 0; b < htmlTags.length; b++) filteredContent = filteredContent.replaceAll(htmlTags[b], "  <html-tag>" + b + "</html-tag>  ");
        if (linkString = filteredContent.match(/www\.\S+|[a-z]+:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi)) {
            b = {};
            for (var c = 0; c < linkString.length; c++) if (!b[linkString[c]]) {
                var d = linkString[c].length;
                d = linkString[c].lastIndexOf(".") == d - 1 ? linkString[c].substring(0, d - 1) : linkString[c];
                var e = d.indexOf("www.") == 0 ? "http://" + d : d;
                filteredContent = filteredContent.replaceAll(d, "<a href='" + e + "' target='_blank'>" + d + "</a>");
                b[linkString[c]] = true
            }
        }
        for (b = 0; b < htmlTags.length; b++) filteredContent = filteredContent.replaceAll("  <html-tag>" + b + "</html-tag>  ", htmlTags[b]);
        if (a == true) filteredContent = this.previewVersion(filteredContent);
        return filteredContent
    },
    previewVersion: function (a) {
        return a.replace(/<a /g, '<span class="content-preview-dlg" ').replace(/<\/a>/g, "</span>")
    },
    enableInsertBtn: function () {
        tabImg = $("#insert-img-tabs-1").is(":visible") ? $("#editor-uploaded-img") : $("#editor-web-img");
        tabImg.attr("src") == tabImg.attr("placeholder-src") || tabImg.attr("src").length == 0 ? $("#upload-attach").next(".ui-dialog-buttonpane").children().children("button:last").disableButton() : $("#upload-attach").next(".ui-dialog-buttonpane").children().children("button:last").enableButton();
        return false
    },
    filterHtmlStyle: function (a) {
        a.each(function () {
            var b = $(this).html();
            b = b.replace(/<[\s\S]+?>/gi, function (c) {
                return c.replace(/position:\s*\S*(absolute|fixed)/gi, "")
            });
            $(this).html(b)
        })
    }
};
ce6.editor.uploadImgDialog = {
    autoOpen: false,
    modal: true,
    width: 450,
    title: "Insert an Image",
    resizable: false,
    open: function () {
        $(this).css({
            padding: "0",
            height: "197px",
            overflow: "hidden"
        });
        $(".nicEdit-pane").parent().css({
            "z-index": 0
        });
        ce6.editor.enableInsertBtn()
    },
    beforeClose: function () {
        $(".nicEdit-pane").parent().css({
            "z-index": 99999
        })
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close")
        },
        Insert: function () {
            $(".nicEdit-main").focus();
            ce6.editor.insertImage();
            $(this).dialog("close")
        }
    }
};