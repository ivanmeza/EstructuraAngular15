import { Component, OnInit, Pipe, PipeTransform, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validator,
  Validators,
} from '@angular/forms';
import { FirmaTable } from '../../../clases/firma/firmaTable';
import { Firma } from '../../../clases/firma/firma';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NgZorroAntdModule } from 'src/app/shared/ng-zorro';
import { CommonModule } from '@angular/common';
import { Archivos } from 'src/app/clases/archivos/archivos';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Buscador } from 'src/app/clases/firma/buscador';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-firma',
  standalone: true,
  templateUrl: './firma.component.html',
  styleUrls: ['./firma.component.scss'],
  imports: [
    NgZorroAntdModule,
    ReactiveFormsModule,
    CommonModule,

  ],
})
export class FirmaComponent implements OnInit {
  // -------------------------------------------------------
  private formBuilder = inject(FormBuilder);
  private modal = inject(NzModalService);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private sanitizer = inject(DomSanitizer);
  // -------------------------------------------------------

  src: any;
  pageindex: number = 1;
  totalItems: number = 0;
  limit: number = 5;
  isVisible = false;
  isConfirmLoadingFirma: boolean = false;
  isConfirmLoadingFile: boolean = false;
  isConfirmLoadingBuscador: boolean = false;
  previewImage: string | undefined = '';
  previewVisible = false;

  credencialesFirma!: FormGroup;
  file!: FormGroup;
  SearchDocuemntos!: FormGroup;
  modalvisiblefirma: boolean = false;
  modalDocumento: boolean = false;
  firmaLista: FirmaTable[] = [];
  SearchDoc: Buscador = new Buscador();
  loadingtablaAmparos: boolean = true;
  firma: Firma = new Firma();
  firmaSelected: FirmaTable = new FirmaTable();
  firmaIndex: any = -1;
  progres: number = 0;
  previewfile: boolean = false;
  añadirFile: boolean = false;
  url!: any;
  estado!: number;
  verDocumentoModal: boolean = false;
  ngOnInit(): void {
    this.getAllFirmas();
    this.getTablaFirmas();
    this.credencialesFirma = this.formBuilder.group({
      firmaSistema: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          // Validators.pattern('[a-z-A-ZñÑáéíóúÁÉÍÓÚs# ]{0,254}'),
        ],
      ],
      firmaElectronica: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          // Validators.pattern('[a-z-A-ZñÑáéíóúÁÉÍÓÚs ]{0,254}'),
        ],
      ],
    });
    this.file = this.formBuilder.group({
      docFirma: [null, Validators.required],
    });
    this.SearchDocuemntos = this.formBuilder.group({
      nomDocumentobuscador: [null, Validators.required],
    });
    this.firma.documentos.push(new Archivos());
  }
  async getAllFirmas() {
    try {
      const restablaconteo: any = await this.http
        .get('/tablaconteo')
        .toPromise();
      this.totalItems = restablaconteo;
    } catch (error) {
      console.warn(error);
    }
  }
  async getTablaFirmas() {
    this.loadingtablaAmparos = true;
    try {
      const restablafirma: any = await this.http
        .post('tabla', {
          pageindex: this.pageindex,
          registros: this.limit,
        })
        .toPromise();
      this.firmaLista = restablafirma;

      this.loadingtablaAmparos = false;
    } catch (error) {
      console.warn(error);
    }
  }
  onPageIndexChange(event: number) {
    try {
      this.pageindex = event;
      this.getTablaFirmas();
    } catch (error) {
      console.warn(error);
    }
  }
  ReloadFiles() {
    this.getTablaFirmas();
    this.getAllFirmas();
    this.SearchDocuemntos.reset();
  }
  subirFile() {
    this.modalDocumento = true;
  }
  documentosSelectRow(obj: any, index: any) {
    this.firmaSelected = obj;
    this.firmaIndex = index;
    console.log(obj);
  }
  modalFirmar() {
    this.modalvisiblefirma = true;
  }
  Cancelmodalfirma() {
    this.credencialesFirma.reset();
    this.modalvisiblefirma = false;
    // this.isVisibleAmparos = true;
  }
  async VerDocumento() {
    try {
      const resverDocumento: any = await this.http
        .post('ver_doc', {
          id_doc_firma: this.firmaSelected.id_doc_firma,
        })
        .toPromise();
      console.log(resverDocumento);
      this.verDocumentoModal = true;
      if (resverDocumento.estado === true) {
        const res2: any = await this.http
          .get(resverDocumento.mensaje, {
            responseType: 'arraybuffer',
          })
          .toPromise();
        console.log(res2);
        var bytes = new Uint8Array(res2);
        var blob = new Blob([bytes], { type: 'application/pdf' });
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          window.URL.createObjectURL(blob)
        );
      } else {
        this.url = resverDocumento.mensaje;
      }
    } catch (error) {
      console.warn(error);
    }
  }
  CancelModalSubirFile() {
    this.file.reset();
    this.modalDocumento = false;
    this.previewfile = false;
  }
  selectMultipleImageDinamico(event: any) {
    const pdf = event.target.files[0];
    const validacionfilefirma = event.target.files[0].type;
    if (validacionfilefirma === 'application/pdf') {
      if (typeof FileReader !== 'undefined') {
        this.previewfile = true;
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.src = e.target.result;
        };
        reader.readAsArrayBuffer(pdf);
        this.progres = 100;
        this.firma.documentos[0].files = this.firma.documentos[0].files.concat(
          event.target.files[0]
        );
        console.log(this.firma.documentos[0].files[0].size);
      } else {
        this.modal.error({
          nzTitle: 'Error al visualizar el documento',
          nzContent: 'Solo puede visualizar la tabla con los datos del mismo',
        });
        this.progres = 100;
        this.firma.documentos[0].files = this.firma.documentos[0].files.concat(
          event.target.files[0]
        );
      }
    } else {
      this.modal.error({
        nzTitle: 'Error al subir el archivo',
        nzContent: 'Solo puede subir archivos con el formato PDF',
      });
    }
  }
  cancelfile() {
    this.firma.documentos[0].files = [];
    this.src = null;
    this.previewfile = false;
  }
  async BuscardorFile() {
    for (const i in this.SearchDocuemntos.controls) {
      this.SearchDocuemntos.controls[i].markAsDirty();
      this.SearchDocuemntos.controls[i].updateValueAndValidity();
    }
    if (this.SearchDocuemntos.valid) {
      if (this.isConfirmLoadingBuscador) return;
      this.isConfirmLoadingBuscador = true;
      try {
        const resbuscador: any = await this.http
          .post('tabla', {
            pageindex: this.pageindex,
            registros: this.limit,
            nom_doc: this.SearchDoc.nombreDocumentoSearch,
          })
          .toPromise();
        // console.log(resbuscador);
        this.firmaLista = resbuscador;
        console.log(this.firmaLista);
        this.isConfirmLoadingBuscador = false;
      } catch (error) {
        console.warn(error);
      }
    }
  }
  async firmarDocumento() {
    for (const i in this.credencialesFirma.controls) {
      this.credencialesFirma.controls[i].markAsDirty();
      this.credencialesFirma.controls[i].updateValueAndValidity();
    }
    if (this.credencialesFirma.valid) {
      if (this.isConfirmLoadingFirma) return;
      this.isConfirmLoadingFirma = true;

      try {
        const resfirmado: any = await this.http
          .post('firma_doc', {
            id_doc_firma: this.firmaSelected.id_doc_firma,
            pass: this.firma.pass,
            pass_firma: this.firma.pass_firma,
          })
          .toPromise();
        console.log(resfirmado);
        if (resfirmado.estado == true) {
          this.message.success(`El documento ${resfirmado.mensaje}`);
        }
        this.getTablaFirmas();
        this.modalvisiblefirma = false;
        this.credencialesFirma.reset();
      } catch (error) {
        // console.warn(error);
        this.message.error('El Documento ya fue Firmado');
        this.getTablaFirmas();
        this.modalvisiblefirma = false;
        this.credencialesFirma.reset();
      }
      this.isConfirmLoadingFirma = false;
    }
  }
  async guardarFile() {
    for (const i in this.file.controls) {
      this.file.controls[i].markAsDirty();
      this.file.controls[i].updateValueAndValidity();
    }
    if (this.file.valid) {
      if (this.isConfirmLoadingFile) return;
      this.isConfirmLoadingFile = true;
      let formData = new FormData();
      try {
        this.firma.documentos[0]?.files.forEach((f: any) => {
          formData.append('docFirma', f);
        });
        const resfile: any = await this.http
          .post('getGuardarDoc', formData)
          .toPromise();
        if (resfile.estado == true) {
          this.message.success('Se subio el documento correctamente');
        } else {
          this.message.success(
            'Error! ocurrio un problema al subir el documento'
          );
        }
        this.getTablaFirmas();
        this.modalDocumento = false;
        this.file.reset();
        this.previewfile = false;
      } catch (error) {
        console.log(error);
      }
      this.isConfirmLoadingFile = false;
    }
  }
}

@Pipe({
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
