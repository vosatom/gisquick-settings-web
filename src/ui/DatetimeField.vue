<template>
  <input-field
    class="datetime-field"
    :color="color"
    :class="{focused}"
    :label="label"
  >
    <div class="fields f-row">
      <v-text-field
        ref="timeField"
        class="filled time-field f-grow"
        valid-chars="[0-9:]"
        :value="time || tempTime"
        v-bind="$attrs"
        @change="onTimeTextChage"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      >
        <template v-slot:append>
          <v-menu
            ref="menu"
            aria-label="Select time"
            transition="slide-y"
            align="rr;bb,tt"
            content-class="popup-content popup-menu light"
          >
            <template v-slot:activator="{ open }">
              <div class="btn" @click="open">
                <v-icon name="clock"/>
              </div>
            </template>
            <template v-slot:menu>
              <v-time-picker
                :value="time || tempTime"
                @input="onTimeInput"
              />
            </template>
          </v-menu>
        </template>
      </v-text-field>
      <v-text-field
        ref="textField"
        class="filled date-field f-grow"
        valid-chars="[0-9.]"
        :value="dateTextValue"
        v-bind="$attrs"
        @change="onDateTextChage"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      >
        <template v-slot:append>
          <v-menu
            ref="menu"
            aria-label="Select date"
            transition="slide-y"
            align="rr;bb,tt"
            content-class="popup-content popup-menu light"
          >
            <template v-slot:activator="{ open }">
              <div class="btn" @click="open">
                <v-icon name="calendar"/>
              </div>
            </template>
            <template v-slot:menu>
              <v-date-picker
                :min="minDate"
                :max="maxDate"
                :value="date"
                @input="onDateInput"
              />
            </template>
          </v-menu>
        </template>
      </v-text-field>
    </div>
  </input-field>
</template>

<script>
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import parseISO from 'date-fns/parseISO'
import isAfter from 'date-fns/isAfter'

import Focusable from '@/ui/mixins/Focusable'
import InputField from '@/ui/InputField.vue'
import VDatePicker from './DatePicker.vue'
import VTimePicker from './TimePicker.vue'

export function toDate (v) {
  if (v && typeof v === 'string') {
    v = parseISO(v)
  }
  return v
}

const TimeRegex = /^\d(\d)?:\d\d$/

export default {
  name: 'DatetimeField',
  mixins: [Focusable],
  components: { InputField, VDatePicker, VTimePicker },
  props: {
    // ISO string or Date
    value: [String, Date],
    min: [String, Date],
    max: [String, Date],
    dateDisplayFormat: {
      type: String,
      default: 'dd.MM.yyyy'
    },
    color: String,
    label: String,
    valueFormat: String
  },
  // inheritAttrs: false,
  data () {
    return {
      dateTextValue: '',
      tempTime: ''
    }
  },
  computed: {
    minDate () {
      return this.parseValue(this.min)
    },
    maxDate () {
      return this.parseValue(this.max)
    },
    date () {
      const date = this.parseValue(this.value)
      if (this.isValidDate(date)) {
        if (this.minDate && isAfter(this.minDate, date)) {
          return this.minDate
        }
        if (this.maxDate && isAfter(date, this.maxDate)) {
          return this.maxDate
        }
        return date
      }
      return null
      // return this.value
    },
    time () {
      if (this.date) {
        const h = this.date.getHours()
        const m = this.date.getMinutes()
        return `${h}:${m.toString().padStart(2, '0')}`
      }
      return null
    }
  },
  watch: {
    date: {
      immediate: true,
      handler (v) {
        if (this.isValidDate(v)) {
          this.dateTextValue = format(v, this.dateDisplayFormat)
        } else if (!v) {
          this.dateTextValue = ''
        }
        // if (this.value !== this.formatValue(v)) {
        //   this.emitValue(v)
        // }
      }
    }
  },
  methods: {
    onTimeTextChage (value) {
      if (value && TimeRegex.test(value)) {
        const [h, m] = value.split(':').map(v => parseInt(v))
        if (h > 23 || m > 59) {
          value = `${Math.min(h, 23)}:${Math.min(m, 59)}`
        }
        this.onTimeInput(value)
      }
    },
    onDateTextChage (value) {
      if (value) {
        try {
          const date = parse(value, this.dateDisplayFormat, new Date())
          if (this.isValidDate(date)) {
            this.updateDate(value)
          }
        } catch (err) {
          console.error(err)
          this.dateTextValue = this.date ? format(this.date, this.dateDisplayFormat) : ''
        }
      } else {
        this.dateTextValue = ''
        this.$emit('input', null)
      }
    },
    updateDate (v) {
      const time = this.time || this.tempTime
      if (time) {
        v = new Date(v)
        const [h, m] = time.split(':')
        v.setHours(h, m, 0)
      }
      this.emitValue(v)
      if (this.tempTime) {
        this.tempTime = ''
      }
    },
    onTimeInput (v) {
      if (this.date) {
        const d = new Date(this.date)
        const [h, m] = v.split(':')
        d.setHours(h, m, 0)
        this.emitValue(d)
        this.tempTime = ''
      } else {
        this.tempTime = v
      }
    },
    onDateInput (v) {
      this.updateDate(v)
      this.$refs.menu.closeMenu()
      this.$refs.textField.focus()
    },
    parseValue (v) {
      if (v instanceof Date ) {
        return v
      }
      if (this.valueFormat) {
        try {
          return parse(v, this.valueFormat, new Date())
        } catch (err) {
          console.error(err)
          return new Date()
        }
      } else {
        return toDate(v)
      }
    },
    formatValue (v) {
      if (v && this.valueFormat) {
        return format(v, this.valueFormat)
      }
      return v
    },
    emitValue (v) {
      this.$emit('input', this.formatValue(v))
    },
    isValidDate (date) {
      return date && date.getFullYear() > 1000
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-field {
  min-width: 130px;
  .fields {
    --gutter: 0;
    gap: 6px;
  }
  .btn {
    display: flex;
    opacity: 0.9;
    padding-inline: 3px;
    cursor: pointer;
  }
}
</style>
