<template>
  <div class="timepicker">
    <div class="field">
      <span
        :class="{inactive: view !== 'h'}"
        v-text="displayedValue.hour"
        @click="view = 'h'"
      />:
      <span
        :class="{inactive: view === 'h'}"
        v-text="displayedValue.minute"
        @click="view = 'm'"
      />
      <span class="mode" v-text="parsedValue.pm ? 'PM' : 'AM'" @click="toggleDaytime"/>
    </div>
    <div class="container">
      <div
        ref="clock"
        class="clock"
        :style="clockStyle"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
      >
        <div class="pointer" :class="pointerClass"/>
        <div class="pivot"/>
        <div
          v-for="(l, i) in labels"
          :key="i"
          class="label"
          :style="l.style"
        >
          <span
            class="number"
            :class="{active: l.active}"
            v-text="l.text"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { eventCoord, DragHandler } from '@/events'

export default {
  props: {
    value: [String, Date],
    minuteStep: {
      type: [Number, String],
      default: 1
    }
  },
  data () {
    return {
      view: 'h',
      tempValue: null
    }
  },
  computed: {
    // array of strings
    parts () {
      return this.tempValue || this.value?.split(':') || []
    },
    hoursValid () {
      const v = this.parts[0]
      return /^\d\d?$/.test(v) && parseInt(v) < 24
    },
    minutesValid () {
      const v = this.parts[1]
      return /^\d\d$/.test(v) && parseInt(v) < 59
    },
    parsedValue () {
      const [h, m] = this.parts.map(v => parseInt(v))
      return {
        hour: (h > 11 ? h - 12 : h) || 0,
        minute: m || 0,
        pm: h > 11
      }
    },
    displayedValue () {
      return {
        hour: this.hoursValid ? this.parsedValue.hour || 12 : '--',
        minute: this.parts?.[1] ?? '--'
      }
    },
    clockStyle () {
      let angle =  this.view === 'h'
        ? (360 / 12) * this.parsedValue.hour
        : (360 / 60) * this.parsedValue.minute
      return {
        '--rotation': Number.isFinite(angle) ? angle : 0
      }
    },
    pointerClass () {
      return {
        small: this.view !== 'h' && this.parsedValue.minute % 5 !== 0
      }
    },
    hLabels () {
      const hours = new Array(12).fill(0).map((_, i) => i)
      return hours.map(v => {
        const angle = (360 / hours.length) * v
        return {
          text: v === 0 ? 12 : v,
          active: this.parsedValue.hour % 12 === v,
          style: {
            '--angle': angle
          }
        }
      })
    },
    mLabels () {
      const values = new Array(12).fill(0).map((_, i) => i)
      return values.map(v => {
        const angle = (360 / values.length) * (v)
        return {
          text: v === 0 ? '00' : 5 * v,
          active: (this.parsedValue.minute / 5) % 12 === v,
          style: {
            '--angle': angle
          }
        }
      })
    },
    labels () {
      return this.view === 'h' ? this.hLabels : this.mLabels
    }
  },
  methods: {
    toggleDaytime () {
      if (this.hoursValid) {
        let hour = this.parsedValue.hour
        if (!this.parsedValue.pm) {
          hour = hour + 12
        }
        if (this.minutesValid) {
          this.$emit('input', `${hour}:${this.parts[1]}`)
        } else {
          this.tempValue = [hour.toString(), null]
        }
        // this.view = 'h'
      }
    },
    formatMinutes (m) {
      if (m === 60) {
        m = 0
      }
      return m.toString().padStart(2, '0')
    },
    formatHours (h) {
      h = h === 12 ? 0 : h
      if (this.parsedValue.pm) {
        h += 12
      }
      return h.toString()
    },
    onDragStart (e) {
      const bbox = this.$refs.clock.getBoundingClientRect()
      const centerX = bbox.x + bbox.width / 2
      const centerY = bbox.y + bbox.height / 2

      const update = e => {
        const [x, y] = eventCoord(e)
        let angle = 90 + Math.atan2(y - centerY, x - centerX) * 180 / Math.PI
        if (angle < 0) {
          angle = 360 + angle
        }
        let value
        if (this.view === 'h') {
          const hour = this.formatHours(Math.round(angle / 30))
          if (this.minutesValid) {
            value = `${hour}:${this.parts[1]}`
          } else {
            this.tempValue = [hour, null]
          }
        } else {
          const step = parseInt(this.minuteStep)
          let minute = Math.round(angle / (360 / 60))
          minute = Math.round(minute / step) * step
          minute = this.formatMinutes(minute)
          if (this.hoursValid) {
            value = `${this.parts[0]}:${minute}`
          } else {
            this.tempValue = [null, minute]
          }
        }
        if (value) {
          this.$emit('input', value)
          this.tempValue = null
        }
      }
      const onEnd = () => {
        if (this.view === 'h') {
          this.view = 'm'
        }
      }
      update(e)
      DragHandler(e, { onMove: update, onEnd })
    }
  }
}
</script>

<style lang="scss" scoped>
.timepicker {
  width: 240px;
  // border: 1px solid #aaa;
}
.field {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  font-size: 20px;
  font-weight: 500;
  line-height: 1;
  padding: 6px;
  background-color: var(--color-primary);
  color: #fff;
  > * {
    cursor: pointer;
    &.inactive {
      opacity: 0.7;
    }
  }
  .mode {
    font-size: 14px;
  }
}
.container {
  height: 240px;
  padding: 8px;
  // display: grid;
  display: flex;
  position: relative;
  border: solid #bbb;
  border-width: 0 1px 1px 1px;
}
.clock {
  position: relative;
  border-radius: 50%;
  border: 1px solid #bbb;
  user-select: none;
  font-size: 16px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.06);
  .label {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    pointer-events: none;
    transform: rotate(calc(var(--angle) * 1deg));
  }
  .number {
    position: absolute;
    padding: 9px;
    transform: translateX(-50%) rotate(calc(var(--angle) * -1deg));
    pointer-events: auto;
    line-height: 1;
    // padding-top: 3px;
    // display: flex;
    // align-items: center;
    // width: 20px;
    // height: 20px;
    &.active {
      color: #fff;
    }
  }
  .pointer {
    position: absolute;
    height: calc(50% - 16px);
    width: 2px;
    background-color: var(--color-primary);;
    left: calc(50% - 1px);
    bottom: 50%;
    // transform-origin: 50% 100%;
    transform-origin: bottom;
    transform: rotate(calc(var(--rotation) * 1deg));
    --size: 28px;
    &::after {
      content: "";
      width: var(--size);
      height: var(--size);
      display: block;
      background-color: var(--color-primary);
      transform: translate(calc(-50% + 1px), -46%);
      border-radius: 50%;
    }
    &.small {
      --size: 14px;
    }
  }
  .pivot {
    position: absolute;
    width: 9px;
    height: 9px;
    background-color: var(--color-primary);
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
