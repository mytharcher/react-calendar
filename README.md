React Calendar
==========

Usage
----------

~~~jsx
import { MonthView } from '@mytharcher/react-calendar';

class YourComponent extends React.Component {
  render() {
    return (
      <MonthView
        year={2019}
        month={9}
        DateRenderer={date => date.getDate()}
      >
    );
  }
}
~~~
