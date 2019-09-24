const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default
{
  computed:
    {
      kind() {
        if(!this.year) return '';
        if(this.month) {
          return this.day ? 'Hourly' : 'Daily';
        } else if(this.week) {
          return 'Weekly';
        } else return 'Monthly';
      },
      ticks() {
        let ticks = [];
        let monday;
        switch (this.kind) {
          case 'Weekly':
            // get the date of Monday for the given week
            monday = new Date(this.year, 0, 4);
            monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7 + (this.week - 1) * 7);
            for (let i = 1; i <= 7; i++) {
              const d = monday.getDate();
              const mon = months[monday.getMonth()];
              ticks.push((d < 10 ? '0' : '') + d + ' ' + mon);
              monday.setDate(monday.getDate() + 1);
            }
            break;
          case 'Hourly':
            ticks = ['00','01','02','03','04','05','06','07','08','09',
              '10','11','12','13','14','15','16','17','18','19',
              '20','21','22','23'
            ];
            break;
          case 'Daily':
            ticks = ['01','02','03','04','05','06','07','08','09','10',
              '11','12','13','14','15','16','17','18','19','20',
              '21','22','23','24','25','26','27','28','29','30','31'
            ];
            break;
          case 'Monthly':
            ticks = ['01','02','03','04','05','06','07','08','09','10','11','12'];
            break;
        }
        return ticks;
      },
    }
}
