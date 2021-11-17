(function($) {
    $.fn.tabellone = function(conf) {
        var ddom = $('<div title="Aggiungi '+conf.item_name+'"/>')
            .attr('data', conf.structure)
            .append($('<p class="validateTips">All form fields are required.</p>'))
            .append($('<form />').append($('<fieldset />')));
        for (let s of conf.structure){
            ddom.find('fieldset')
                .append($('<label />')
                    .attr('for', s.name)
                    .text(s.title))
                .append($('<input />')
                    .attr('type', s.type)
                    .attr('name', s.name)
                    .addClass('ui-widget-content')
                    .addClass('ui-corner-all'))
        }
        this.append(ddom);
        dialog = ddom.dialog({
            autoOpen: false,
            height: 400,
            width: 350,
            modal: true,
            buttons: {
                "Aggiungi": function () {
                    var data = {};
                    for (let input of $(dialog).find('input')) {
                        data[$(input).attr('name')] = $(input).val();
                    }
                    aggiungi_item(data, $(dialog).find('.ui-dialog-content')[0].data('conf'));
                    dialog.dialog("close");
                },
                Annulla: function () {
                    dialog.dialog("close");
                }
            },
            close: function () {
                $(dialog).find('form')[0].reset();
                //allFields.removeClass("ui-state-error");
            }
        })

        var nav = $('<nav />');
        var btn = $('<button />')
            .addClass('ui-button')
            .addClass('add_button')
            .data('dialog', dialog)
            .attr('id', 'test')
            .click(function () {
                $(this).data('dialog').dialog("open");
            })
        btn.append($('<i class="fas fa-fw fa-plus"></i>'));
        btn.append($('<span/>').text(conf.item_name))
        nav.append(btn);
        this.append(nav);

        var table = $('<table class="ui-widget ui-widget-content" />');
        var thead = $('<thead />').append('<tr />');
        for (let s of conf.structure){
            thead.find('tr').append($('<th />').text(s.title));
        }
        table.append(thead);
        table.append($('<tbody />'));
        this.append(table);
        function aggiungi_item(data, structure) {
            var riga = $('<tr></tr>');
            for (let s of structure){
                riga.append($('<td></td>').text(data[s.name]));
            }
            table.find('tbody').append(riga);
        }
    };
} (jQuery));