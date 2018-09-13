var currentView = 'maintenance';

$(document).ready(function () {
    
    $('.maintenance-empty:not(.last)').attr('contenteditable', true);
    
    $('#devices-submenu')
        .show()
        .children().children(':nth-child(2)').addClass('active');
    
    $('#maintenance-serial-input').autocomplete({
        source: inventorySerials
    });
    
});

$(document).on('focusout', '#maintenance-serial-input', function (e) {
    
    var cell = $(this),
        serialNumber = cell.val();
    
    if (!serialNumber) {
        return;
    }

    $.ajax({
        url: 'devices/ajax/create-maintenance-device/',

        data: {
            serialNumber: serialNumber
        },

        success: function (device) {

            var element = $('#maintenance-table tbody tr:last');
            
            cell.parent().removeClass('input-td');
            cell.remove();

            $.each(device, function (key, value) {

                element.children('td[data-field-name=' + key + ']')
                    .removeClass('empty')
                    .text(value);
                
                if (key === 'device_type') {
                    element.children('td[data-field-name=' + key + ']').attr('data-pk', device.serial_number);
                }

            });

            element.children('td[data-field-name=serial_number]').attr('contenteditable', false);
            element.attr('data-pk', device.pk);
            element.attr('data-serial', device.serial_number);
            element.attr('data-receipt-pk', device.reception_receipt_id);
            
            // Opening editable cells
            element.children('.maintenance-empty').attr('contenteditable', true);
            
            element.children(':nth-child(10)').html('<a href="/devices/' + device.serial_number + '/" class="device-detail-button" data-device-id="' + device.pk + '" data-device-serial="' + device.serial_number + '">ذهاب</a>');
            
            element.children(':last').append('<img src="/static/images/remove.png" class="icon remove-maintenance-item" data-pk="' + device.pk + '">');

            element.after('<tr><td class="input-td" data-input-type="text" data-field-name="serial_number" style="height:38px" contenteditable="true"><input id="maintenance-serial-input" class="table-input"></td>' +
                          '<td data-input-type="text" data-field-name="company_name"></td>' +
                          '<td data-input-type="text" data-field-name="device_type"></td>' +
                          '<td data-input-type="date" data-field-name="entrance_date"></td>' +
                          '<td class="maintenance-empty" data-input-type="text" data-field-name="assignee"></td>' +
                          '<td class="maintenance-empty" data-input-type="text" data-field-name="flaws"></td>' +
                          '<td class="maintenance-empty" data-input-type="text" data-field-name="sparepart_name"></td>' +
                          '<td class="maintenance-empty" data-input-type="number" data-field-name="sparepart_count"></td>' +
                          '<td class="maintenance-empt" data-input-type="text" data-field-name="notes"></td>' +
                          '<td></td><td></td></tr>'
                         );
            
            inventorySerials.remove(serialNumber);
            
            $('#maintenance-serial-input').autocomplete({
                source: inventorySerials
            });
        },

        error: function (error) {

            generateAlerts(error);

            cell.html('');
        }
    });
});

$(document).on('focusout', '.maintenance-empty', function (e) {
    
    var cell = $(this),
        cellType = cell.attr('data-input-type'),
        itemType = cell.parent().parent().parent().attr('data-item-type'),
        fieldName = cell.attr('data-field-name'),
        content = cell.text();
    
    if (!content) {
        return;
    }
    
    if (cellType === 'number' && !isNumeric(content)) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'هذا الحقل يجب أن يكون رقميا',
            position: 'topRight',
            zindex: 99999
        });
        
        cell.text('');
        
        return;
        
    }
    
    $.ajax({
        url: 'ajax/update-cell-content/',

        data: {
            pk: cell.parent().attr('data-pk'),
            type: 'maintenance',
            fieldName: fieldName,
            content: content
        },

        success: function (data) {
            
            if (data.invalid && (fieldName === 'sparepart_name' || fieldName === 'sparepart_count')) {

                iziToast.error({
                    title: 'خطأ',
                    message: 'لا توجد قطع غيار كافية من هذا النوع',
                    position: 'topRight',
                    zindex: 99999
                });

                cell.text(cell.attr('data-value'));

                return;

            }
            
            else if (fieldName === 'notes') {
                cell.addClass('truncate');
            }

            if (data.spareparts && data.spareparts.length) {
                $.each(data.spareparts, function (index, sparepart) {

                    $('#sparepart-inventory-table tbody tr[data-pk=' + sparepart.pk + '] td[data-field-name=count]').text(sparepart.count);

                    if (!index) {

                        if (sparepart.count < sparepart.minimum_qty) {

                            iziToast.warning({
                                title: 'تحذير',
                                message: 'الكمية أقل من الحد الأدنى',
                                position: 'topRight',
                                zindex: 99999
                            });

                        }

                    }

                });
            }
            
            cell
                .removeClass('maintenance-empty')
                .addClass('editable-locked')
                .attr('contenteditable', 'false');
            
        },
        
        error: function (error) {
            
            generateAlerts(error);
            
            var data = error.responseJSON;
            
            if (data.spareparts && data.spareparts.length) {
                
                $.each(data.spareparts, function (index, sparepart) {

                    $('#sparepart-inventory-table tbody tr[data-pk=' + sparepart.pk + '] td[data-field-name=count]').text(sparepart.count);
                });
                
            }
            
            cell.text('');
            
        }
        
    });
});

$(document).on('click', '.remove-maintenance-item', function (e) {
    
    var pk = $(this).attr('data-pk'),
        parent = $(this).parent().parent(),
        serialNumber = parent.children(':first').text();
    
    var removeMaintenanceItem = function () {
        
        $.ajax({
            url: 'devices/ajax/remove-maintenance-device/',
            data: {
                pk: pk
            },

            success: function (data) {

                parent.fadeOut(300, function () {
                    $(this).remove();
                });
                
                if (data.sparepart) {
                    $('#sparepart-inventory-table tbody tr[data-pk=' + data.sparepart.pk + '] td[data-field-name=count]').text(data.sparepart.count);
                }
                
                inventorySerials.push(serialNumber);
            
                $('#maintenance-serial-input').autocomplete({
                    source: inventorySerials
                });
            }
        });
        
    }
    
    executeAfterPassword(removeMaintenanceItem);
    
});