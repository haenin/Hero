<template>
  <div class="dept-vacation-wrapper">
    <div class="dept-vacation-page">
      <div class="dept-vacation-panel">
        <div class="panel-header">
          <div class="panel-title">
            <template v-if="deptName">
              <span class="dept-name">{{ deptName }}</span>
              <span class="name"> 휴가 캘린더</span>
            </template>
            <template v-else>부서 휴가 캘린더</template>
          </div>
          <div class="month-nav">
            <button type="button" class="month-btn" :disabled="!canPrev" @click="changeMonth(-1)">‹</button>
            <span class="month-label">{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
            <button type="button" class="month-btn" @click="changeMonth(1)">›</button>
          </div>
        </div>

        <div class="calendar-container">
          <div class="calendar-weekdays">
            <div v-for="dayName in weekdayLabels" :key="dayName" class="weekday">{{ dayName }}</div>
          </div>

          <div class="calendar-grid">
            <div v-for="(week, wIdx) in calendarWeeks" :key="wIdx" class="calendar-row">
              
              <div class="cell-background-layer">
                <div
                  v-for="(day, dIdx) in week"
                  :key="dIdx"
                  class="calendar-cell"
                  :class="{
                    'calendar-cell--other': !day.isCurrentMonth,
                    'calendar-cell--today': isToday(day.date)
                  }"
                >
                  <div class="cell-date">
                    <span v-if="day.date">{{ day.date.getDate() }}</span>
                  </div>
                </div>
              </div>

              <div class="event-render-layer">
                <div
                  v-for="ev in getSortedEventsForWeek(week)"
                  :key="ev.id + wIdx"
                  class="vacation-tag-bar"
                  :class="ev.isSelf ? 'vacation-tag--self' : 'vacation-tag--team'"
                  :style="getEventBarStyle(ev, week)"
                >
                  {{ ev.employeeName }} - {{ ev.type }}
                </div>
              </div>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item">
              <span class="legend-color legend-color--self"></span>
              <span class="legend-label">본인 휴가</span>
            </div>
            <div class="legend-item">
              <span class="legend-color legend-color--team"></span>
              <span class="legend-label">팀원 휴가</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useDepartmentVacationStore } from '@/stores/vacation/departmentVacation'

const authStore = useAuthStore()
const { employeeId, user } = storeToRefs(authStore)
const deptVacationStore = useDepartmentVacationStore()
const { items } = storeToRefs(deptVacationStore)

interface DeptVacationEvent {
  id: string; employeeId: number; employeeName: string; type: string;
  startDate: string; endDate: string; isSelf: boolean;
  isContinuous?: boolean;
  rowIndex?: number;
}

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']
const today = new Date()
const initial = new Date(today.getFullYear(), today.getMonth(), 1)

const currentYear = ref(initial.getFullYear())
const currentMonth = ref(initial.getMonth())
const minMonth = new Date(2025, 0, 1)
const currentMonthDate = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const canPrev = computed(() => currentMonthDate.value > minMonth)

const toLocalMidnightMs = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const isToday = (date: Date | null): boolean => date ? toLocalMidnightMs(date) === toLocalMidnightMs(today) : false
const parseYmd = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const vacationEvents = computed<DeptVacationEvent[]>(() =>
  items.value.map((dto: any) => {
    const start = dto.startDate
    const end = dto.endDate || start
    return {
      id: String(dto.vacationLogId),
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      type: dto.vacationTypeName,
      startDate: start,
      endDate: end,
      isSelf: employeeId.value != null ? dto.employeeId === employeeId.value : false,
      isContinuous: start !== end
    }
  })
)

const getSortedEventsForWeek = (week: any[]) => {
  const weekStart = toLocalMidnightMs(week[0].date)
  const weekEnd = toLocalMidnightMs(week[6].date)

  const weekEvents = vacationEvents.value.filter(ev => {
    const sMs = toLocalMidnightMs(parseYmd(ev.startDate))
    const eMs = toLocalMidnightMs(parseYmd(ev.endDate))
    return sMs <= weekEnd && eMs >= weekStart
  }).sort((a, b) => {
    if (a.isContinuous !== b.isContinuous) return a.isContinuous ? -1 : 1
    const startA = toLocalMidnightMs(parseYmd(a.startDate))
    const startB = toLocalMidnightMs(parseYmd(b.startDate))
    if (startA !== startB) return startA - startB
    return toLocalMidnightMs(parseYmd(b.endDate)) - toLocalMidnightMs(parseYmd(a.endDate))
  })

  const rows: number[][] = []
  return weekEvents.map(ev => {
    const sMs = toLocalMidnightMs(parseYmd(ev.startDate))
    const eMs = toLocalMidnightMs(parseYmd(ev.endDate))
    let rowIndex = 0
    while (rows[rowIndex] && rows[rowIndex].some(occupiedEnd => occupiedEnd >= sMs)) {
      rowIndex++
    }
    if (!rows[rowIndex]) rows[rowIndex] = []
    rows[rowIndex].push(eMs)
    return { ...ev, rowIndex: rowIndex + 1 }
  })
}

const getEventBarStyle = (ev: DeptVacationEvent, week: any[]) => {
  const weekStart = toLocalMidnightMs(week[0].date)
  const evStart = toLocalMidnightMs(parseYmd(ev.startDate))
  const evEnd = toLocalMidnightMs(parseYmd(ev.endDate))

  const startIdx = Math.max(0, Math.round((evStart - weekStart) / (1000 * 60 * 60 * 24)))
  const endIdx = Math.min(6, Math.round((evEnd - weekStart) / (1000 * 60 * 60 * 24)))
  
  return {
    gridColumnStart: startIdx + 1,
    gridColumnEnd: `span ${endIdx - startIdx + 1}`,
    gridRowStart: ev.rowIndex
  }
}

const calendarWeeks = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1)
  const last = new Date(currentYear.value, currentMonth.value + 1, 0)
  const start = new Date(first); start.setDate(first.getDate() - first.getDay())
  const weeks = []
  let cursor = new Date(start)
  while (cursor <= last || cursor.getDay() !== 0) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push({ date: new Date(cursor), isCurrentMonth: cursor.getMonth() === currentMonth.value })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
})

const loadCurrentMonth = () => deptVacationStore.fetchDepartmentVacation(currentYear.value, currentMonth.value + 1)
const changeMonth = (diff: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value + diff, 1)
  if (newDate < minMonth) return
  currentYear.value = newDate.getFullYear(); currentMonth.value = newDate.getMonth()
  loadCurrentMonth()
}
onMounted(loadCurrentMonth)
const deptName = computed(() => user.value?.departmentName?.trim() || '')
</script>

<style scoped src="@/assets/styles/vacation/department-vacation.css"></style>
