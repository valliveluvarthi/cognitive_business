import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as moment from 'moment';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { faCheckSquare, faCheckCircle, faChevronDown, faExclamationCircle, faTimes, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { FeedbackLogService } from 'src/app/services/feedback-log.service';

@Component({
  selector: 'cb-add-edit-logs',
  templateUrl: './add-edit-logs.component.html',
  styleUrls: ['./add-edit-logs.component.scss']
})
export class AddEditLogsComponent implements OnInit {

  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamation = faExclamationCircle;
  faChevronDown = faChevronDown;
  faSquare = faSquare;
  faCheckSquare = faCheckSquare;
  faCalender = faCalendarWeek;

  clearingLog = false;
  saving = false;
  fromSlots = [];
  toSlots = [];
  form: any = {
    date: '',
    from: '5 AM',
    to: '5 AM',
    reasons: [],
    /* turbine: '', */
    /* vessel: '', */
    note: ''
  };

  @Input() loading: boolean = true;
  @Input() forSuccess: boolean = true;
  @Input() data: {
    cancellationReasons: Array<any>,
  } = {
      cancellationReasons: [],
    };

  @Input() selectedData: any = {};
  @Input() siteData: any = {};

  @Output() onClose = new EventEmitter();

  constructor(
    private feedbackService: FeedbackLogService,
    private util: CommonUtilService,
    private calendar: NgbCalendar
  ) {
    this.form.date = calendar.getToday();
  }

  ngOnInit(): void {
    this.setData();
  }

  setData() {
    for (let i = 0; i < this.data.cancellationReasons.length; i++) {
      const element = this.data.cancellationReasons[i];
      element.checked = false;
    }
    const slots = this.feedbackService.getTimeSlots();
    this.fromSlots = [...slots];
    slots.shift();
    this.toSlots = [...slots];
    const date = moment(this.selectedData.date, 'D-M-YYYY');
    this.form.date = {
      day: date.get('date'),
      month: date.get('month') + 1,
      year: date.get('year')
    };
    this.form.from = this.selectedData.time;
    this.form.to = moment(this.form.from, 'h A').add(1, 'h').format('h A');
    if (this.selectedData.data) {
      this.form.note = this.selectedData.data.notes;
      /* this.form.turbine = this.selectedData.data.location;
      this.form.vessel = this.selectedData.data.vessel || this.data.vessels[0]; */
      const selectedReasons = this.selectedData.data.cancelReason;
      if (selectedReasons) {
        for (let i = 0; i < this.data.cancellationReasons.length; i++) {
          const element = this.data.cancellationReasons[i];
          for (let j = 0; j < selectedReasons.length; j++) {
            const selectedReason = selectedReasons[j];
            if (element.key == selectedReason.key) {
              element.checked = true;
            }
          }
        }
      }
    } else {
      /*   this.form.vessel = this.data.vessels[0];
        this.form.turbine = this.data.turbines[0].key; */
    }
  }

  timeChanged(key) {
    const from = moment(this.form.from, 'h A');
    const to = moment(this.form.to, 'h A');
    if (to.isBefore(from)) {
      if (key == 'from') {
        this.form.to = moment(this.form.from, 'h A').add(1, 'h').format('h A');
      }
      if (key == 'to') {
        this.form.from = moment(this.form.to, 'h A').subtract(1, 'h').format('h A');
      }
    }
  }

  reasonToggle(item) {
    this.form.reasons.push(item.key);
  }

  close(data?) {
    if (this.saving || this.clearingLog) {
      return;
    }
    let obj: any = {
      updateData: false
    };
    if (data) {
      obj = {
        ...data
      }
    }
    this.onClose.emit(obj);
  }

  deleteLog() {
    this.clearingLog = true;
    const date = this.util.getDateString(this.form.date);
    const isoString = moment(date + ' ' + this.form.from, 'D-M-YYYY h A').toISOString();
    this.feedbackService.clearAccess(this.siteData.key, isoString).subscribe((response: any) => {
      if (response) {
        this.clearingLog = false;
        this.close({
          updateData: true,
          for: 'delete',
          data: this.selectedData.data
        });
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while clearing log.'
        });
        this.clearingLog = false;
      }
    }, () => {
      this.clearingLog = false;
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while clearing log.'
      });
    });
  }

  prepareDataForSave() {
    const obj: any = {
      /* location: this.form.turbine, */
      isAccessible: this.forSuccess,
      notes: this.form.note
    }
    if (!this.forSuccess) {
      const reasons = [];
      for (let i = 0; i < this.data.cancellationReasons.length; i++) {
        const element = this.data.cancellationReasons[i];
        if (element.checked) {
          reasons.push(element.key);
        }
      }
      obj.cancelReason = reasons.join(',');
    }
    /* if (this.form.vessel.id != -1) {
      obj.vessel = this.form.vessel.id;
    } */

    const date = this.util.getDateString(this.form.date);
    const from = moment(date + ' ' + this.form.from, 'D-M-YYYY h A').toISOString();
    const to = moment(date + ' ' + this.form.to, 'D-M-YYYY h A').subtract(1, 'second').toISOString();
    return {
      from,
      to,
      accessibility: obj
    };
  }

  getRequests() {
    const obj = this.prepareDataForSave();
    const date = this.util.getDateString(this.form.date);
    const requests = [];
    const isoString = moment(date + ' ' + this.form.from, 'D-M-YYYY h A').toISOString();
    if (this.selectedData.data) {
      requests.push(this.feedbackService.editLog(this.siteData.key, this.selectedData.data.id, {
        ...obj,
        timestamp: isoString
      }));
    } else {
      requests.push(this.feedbackService.saveLog(this.siteData.key, {
        ...obj,
        timestamp: isoString
      }));
    }
    const from = moment(this.form.from, 'h A');
    if (this.form.from == this.form.to || from.add(1, 'h').format('h A') == this.form.to) {
      return requests;
    }
    from.subtract(1, 'h');
    while (from.add(1, 'h').format('h A') != this.form.to) {
      const isoString = moment(date + ' ' + from.format('h A'), 'D-M-YYYY h A').toISOString();
      if (this.selectedData.data) {
        requests.push(this.feedbackService.editLog(this.siteData.key, this.selectedData.data.id, {
          ...obj,
          timestamp: isoString
        }));
      } else {
        requests.push(this.feedbackService.saveLog(this.siteData.key, {
          ...obj,
          timestamp: isoString
        }));
      }
    }
    return requests;
  }

  saveLog() {
    const obj = this.prepareDataForSave();
    if (!this.forSuccess && !obj.accessibility.cancelReason) {
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Cancellation reason is required.'
      });
      return;
    }
    this.saving = true;
    this.feedbackService.setHourlyAccess(this.siteData.key, obj).subscribe((response: any) => {
      if (response) {
        this.saving = false;
        this.close({
          updateData: true,
          for: 'update'
        });
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while saving log.'
        });
        this.saving = false;
      }
    }, () => {
      this.saving = false;
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while saving log.'
      });
    });
  }

}
