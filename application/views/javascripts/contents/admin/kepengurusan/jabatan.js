let modal_create = false;
// pengisian nya di data visi
const datajabatan = new Map();
$('.summernote').summernote({
  toolbar: [
    ['fontsize', ['fontsize']], ['fontname', ['fontname']], ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
    ['para', ['ul', 'ol', 'paragraph']], ['height', ['height']], ['color', ['color']], ['float', ['floatLeft', 'floatRight', 'floatNone']], ['remove', ['removeMedia']], ['table', ['table']], ['insert', ['link', 'unlink', 'video', 'audio', 'hr']], ['mybutton', ['myVideo']], ['view', ['fullscreen', 'codeview']], ['help', ['help']]],
  height: (200),
});
$(function () {

  function dynamic() {
    const table_html = $('#dt_basic');
    table_html.dataTable().fnDestroy()
    const new_table = table_html.DataTable({
      "ajax": {
        "url": "<?= base_url()?>admin/jabatan/ajax_data/",
        "data": {
          pengurus_periode_id: pengurus_periode_id
        },
        "type": 'POST'
      },
      "processing": true,
      "serverSide": true,
      "responsive": true,
      "lengthChange": true,
      "autoWidth": false,
      "columns": [
        { "data": null },
        { "data": 'kode' },
        {
          "data": "nama", render(data, type, full, meta) {
            return full.parrent != '' ? full.parrent : data;
          }
        },
        {
          "data": "nama", render(data, type, full, meta) {
            return full.parrent != '' ? data : '';
          }
        },
        { "data": "slug" },
        {
          // visi misi
          "data": "id", render(data, type, full, meta) {
            datajabatan.set(full.id, full);
            return `<button
                      class="btn btn-primary btn-sm btn-gambar"
                      data-toggle="modal"
                      data-id="${full.id}"
                      data-target="#modal_detail"
                      onclick="modal_detail(this)"
                      id="btn-gambar"><i class="fas fa-eye"></i></button>`
          }, className: "nowrap"
        },
        { "data": "status_str" },
        {
          "data": "id", render(data, type, full, meta) {
            const btn_lihat = `
              <a class="btn btn-secondary btn-xs" href="">
                <i class="fa fa-eye"></i> Lihat
              </a>
            `;

            const btn_ubah = `
                <button class="btn btn-primary btn-xs"onclick="Ubah('${data}')">
                  <i class="fa fa-edit"></i> Ubah
                </button>
            `;

            const btn_hapus = `
                <button class="btn btn-danger btn-xs" onclick="Hapus(${data})">
                  <i class="fa fa-trash"></i> Hapus
                </button>
            `;

            const btn_jabatan = `
                <a class="btn btn-success btn-xs" href="<?= base_url() ?>admin/jabatan/index/${data}">
                  <i class="fas fa-users"></i> Pengurus
                </a>
            `;

            let btn = btn_jabatan;
            btn += btn_lihat;
            btn += btn_ubah;
            btn += btn_hapus;

            return `<div class="pull-right">${btn}</div>`
          }, className: "nowrap"
        }
      ],
      columnDefs: [{
        orderable: false,
        targets: [0, 7]
      }],

    });
    new_table.on('draw.dt', function () {
      var PageInfo = table_html.DataTable().page.info();
      new_table.column(0, {
        page: 'current'
      }).nodes().each(function (cell, i) {
        cell.innerHTML = i + 1 + PageInfo.start;
      });
    });
  }
  dynamic();

  $("#btn-tambah").click(() => {
    if (!modal_create) {
      refreshParrent();
      $("#tambahModalTitle").text("Tambah jabatan");
      $('#id').val('');
      $('#nama').val('');
      $('#slogan').val('');
      $('#no_urut').val('');
      $('#visi').summernote("code", "");
      $('#misi').summernote("code", "");
      $('#slug').val('');
      $('#foto').val('');
      $('#keterangan').val('');
      modal_create = true;
    }
  });

  $("#nama").keyup(function () {
    refreshSlug();
  });

  $("#parrent_id").change(function () {
    refreshSlug();
  });

  $("#fmain").submit(function (ev) {
    ev.preventDefault();
    const form = new FormData(this);
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/jabatan/' + ($("#id").val() == "" ? 'insert' : 'update'),
      data: form,
      cache: false,
      contentType: false,
      processData: false,
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil disimpan'
      })
      dynamic();
      modal_create = false;
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal disimpan'
      })
    }).always(() => {
      $.LoadingOverlay("hide");
      $('#tambahModal').modal('toggle')
    })
  });

  // hapus
  $('#OkCheck').click(() => {
    let id = $("#idCheck").val()
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/jabatan/delete',
      data: {
        id: id
      }
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil dihapus'
      })
      dynamic();
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal dihapus'
      })
    }).always(() => {
      $('#ModalCheck').modal('toggle')
      $.LoadingOverlay("hide");
    })
  })

  $("#faktifkan").submit(function (ev) {
    ev.preventDefault();
    const form = new FormData(this);
    $.LoadingOverlay("show");
    $.ajax({
      method: 'post',
      url: '<?= base_url() ?>admin/jabatan/activate',
      data: form,
      cache: false,
      contentType: false,
      processData: false,
    }).done((data) => {
      Toast.fire({
        icon: 'success',
        title: 'Data berhasil disimpan'
      })
      dynamic();
    }).fail(($xhr) => {
      Toast.fire({
        icon: 'error',
        title: 'Data gagal disimpan'
      })
    }).always(() => {
      $.LoadingOverlay("hide");
      $('#modal_aktifkan').modal('toggle')
    })
  });
})

const view_gambar = (datas) => {
  $("#img-view").attr('src', `<?= base_url() ?>/files/front/jabatan/${datas.dataset.data}`)
}

// Click Hapus
const Hapus = (id) => {
  $("#idCheck").val(id)
  $("#LabelCheck").text('Form Hapus')
  $("#ContentCheck").text('Apakah anda yakin akan menghapus data ini?')
  $('#ModalCheck').modal('toggle')
}

// Click Ubah
const Ubah = (id) => {
  modal_create = false;
  $("#tambahModalTitle").text("Ubah jabatan");
  $.LoadingOverlay("show");
  $.ajax({
    method: 'get',
    url: '<?= base_url() ?>admin/jabatan/edit',
    data: {
      id: id
    }
  }).done((data) => {
    refreshParrent(data.parrent_id);
    $('#id').val(data.id);
    $('#status').val(data.status);
    $('#nama').val(data.nama);
    $('#no_urut').val(data.no_urut);
    $('#slogan').val(data.slogan);
    $('#visi').summernote("code", data.visi);
    $('#misi').summernote("code", data.misi);
    $('#slug').val(data.slug);
    $('#temp_foto').val(data.foto);
    $('#foto').val('');
    $('#keterangan').val(data.keterangan);
    $('#tambahModal').modal('toggle');
  }).fail(($xhr) => {
    Toast.fire({
      icon: 'error',
      title: 'Gagal mendapatkan Data'
    })
  }).always(() => {
    $.LoadingOverlay("hide");
  })
}

// Detail
const modal_detail = (datas) => {
  const data = datas.dataset;
  const datakep = datajabatan.get(data.id);
  $("#modal_detail_title").html(`Detail Jabatan ${datakep.nama}`);
  $("#modal_detail_body").html(`
                                <h4>Nama:</h4>  ${datakep.nama}
                                <h4>Logo:</h4>  <img  class="img-fluid" src="<?= base_url() ?>/files/front/jabatan/${datakep.foto}">
                                <h4>Visi:</h4>  ${datakep.visi}
                                <h4>Misi:</h4>  ${datakep.misi}
                                <h4>Slogan:</h4>  ${datakep.slogan}
                                <h4>Keterangan:</h4>  ${datakep.keterangan}
  `);
}

const Aktifkan = (id) => {
  $("#aktifkan_id").val(id)
  $('#modal_aktifkan').modal('toggle')
}

const refreshParrent = (selected = false) => {
  $.LoadingOverlay("show");
  $.ajax({
    method: 'get',
    url: '<?= base_url() ?>admin/jabatan/get_parrent',
    data: {
      pengurus_periode_id: pengurus_periode_id
    }
  }).done((data) => {
    const bidang_utama = $('#parrent_id');
    bidang_utama.html('');
    bidang_utama.append(`<option value="">Pilih Bidang</option>`);
    data.forEach((e) => {
      const selected_str = selected == e.id ? 'selected' : '';
      bidang_utama.append(`<option ${selected_str} value="${e.id}">${e.text}</option>`);
    });

  }).fail(($xhr) => {
    Toast.fire({
      icon: 'error',
      title: 'Gagal mendapatkan Data'
    })
  }).always(() => {
    $.LoadingOverlay("hide");
  })
}

const refreshSlug = () => {
  var Text = $("#nama").val();
  const sel = document.getElementById('parrent_id');
  let bidang_utama = sel.value != '' ? sel.options[sel.selectedIndex].text + ' ' : '';
  bidang_utama = bidang_utama.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  Text = Text.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  $("#slug").val(`${pengurus_periode}-${bidang_utama + Text}`);
}