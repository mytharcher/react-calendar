import React from 'react';
import classnames from 'classnames';

function formatDate(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

export default class extends React.Component {
  // 每个日期单元格的
  static dayDecorators = {
    weekday(date) {
      const day = date.getDay();
      return day > 0 && day < 6;
    },
    weekend(date) {
      const day = date.getDay();
      return day === 0 || day === 6;
    },
    today(date, { today }) {
      return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
    },
    pastDay(date, { today }) {
      return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    },
    futureDay(date, { today }) {
      return date > new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    },
    pastMonth(date, { today }) {
      const dateYear = date.getFullYear();
      const todayYear = today.getFullYear();

      if (dateYear > todayYear) {
        return false;
      }

      return dateYear < todayYear || date.getMonth() < today.getMonth();
    },
    futureMonth(date, { today }) {
      const dateYear = date.getFullYear();
      const todayYear = today.getFullYear();

      if (dateYear < todayYear) {
        return false;
      }

      return dateYear > todayYear || date.getMonth() > today.getMonth();
    },
    previousMonth(date, { year, month }) {
      const dateYear = date.getFullYear();

      if (dateYear > year) {
        return false;
      }

      return dateYear < year || date.getMonth() < month;
    },
    nextMonth(date, { year, month }) {
      const dateYear = date.getFullYear();

      if (dateYear < year) {
        return false;
      }

      return dateYear > year || date.getMonth() > month;
    }
  };

  static Header({ day }) {
    return day;
  }

  static Day({ date }) {
    return (
      <span>{date.getDate()}</span>
    );
  }

  tableNode = React.createRef();

  getDecoratorClasses(date, params) {
    const { dayDecorators = {} } = this.props;
    const decorators = { ...this.constructor.dayDecorators, ...dayDecorators };
    return Object.keys(decorators)
      .map((fn) => {
        const result = decorators[fn](date, params);
        return typeof result === 'string'
          ? result
          : result && fn.replace(/([A-Z]+)/g, (matcher, search) => `-${search.toLowerCase()}`);
      })
      .filter(item => Boolean(item))
      .join(' ');
  }

  onClick = (ev) => {
    const { onDateClick, onDayClick } = this.props;
    for (let node = ev.target; node && node !== this.tableNode.current; node = node.parentNode) {
      if (node.parentNode.parentNode.parentNode === this.tableNode.current) {
        if (node.nodeName === 'TD') {
          if (typeof onDateClick === 'function') {
            onDateClick(new Date(Date.parse(node.getAttribute('data-date'))));
          }
        } else if (node.nodeName === 'TH') {
          if (typeof onDayClick === 'function') {
            onDayClick(parseInt(node.getAttribute('data-day'), 10));
          }
        }
      }
    }
  };

  render() {
    const today = new Date();
    const {
      // 月历年份
      year = today.getFullYear(),
      // 月历月份
      month = today.getMonth(),
      // 每周起始日，默认从周日开始
      weekdayStartsWith = 0,
      HeaderRenderer = this.constructor.Header,
      // 每个日期单元格的渲染组件
      DateRenderer = this.constructor.Day,
      // 组件的 className 注入
      className
    } = this.props;

    const weekdays = Array(7).fill(null).map((item, i) => (weekdayStartsWith + i) % 7);

    // 取当月 1 日作为起点
    const start = new Date(year, month, 1);
    // 补全按周计算的起点
    start.setDate(start.getDate() - start.getDay() + weekdayStartsWith);
    // 取得 4 周后的日期
    const fourWeeks = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 28);
    // 如果 4 周以后已经是下一个月（只有 28 天的 2 月）
    if (fourWeeks.getMonth() > month) {
      // 起点再往前推一周
      start.setDate(start.getDate() - 7);
    }

    return (
      <table
        ref={this.tableNode}
        role="presentation"
        onClick={this.onClick}
        className={classnames('ui-month', className)}
      >
        <colgroup>
          {weekdays.map(day => (
            <col key={day} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {weekdays.map(day => (
              <th key={day} data-day={day}>
                <HeaderRenderer day={day} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(6).fill(null).map((_, week) => week).map(week => (
            <tr key={week}>
              {Array(7).fill(null).map((__, day) => {
                const date = new Date(
                  start.getFullYear(),
                  start.getMonth(),
                  start.getDate() + week * 7 + day
                );

                return (
                  <td
                    key={date}
                    className={this.getDecoratorClasses(date, { year, month, today })}
                    data-date={formatDate(date)}
                  >
                    <DateRenderer year={year} month={month} date={date} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
