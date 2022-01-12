export const searchConfig = [{
    value: 'sort_by',
    label: '排序方式',
    list: [
      { value: 'INTELLIGENCE', name: '智能排序' },
      { value: 'TIME', name: '时间排序' }
    ]
  }, {
    value: 'field_range',
    label: '搜索范围',
    list: [
      { value: 'ALL', name: '全部范围' },
      { value: 'TITLE', name: '标题' }, 
      { value: 'FULLTEXT', name: '全文' }
    ]
  }, {
    value: 'time_range',
    label: '时间范围',
    list: [
      { value: "ALL", name: "全部" },
      { value: "WEEK", name: "本周" },
      { value: "MONTH", name: "本月" },
      { value: "YEAR", name: "本年" },
    ]
  }
];

export const searchCategory = [
  { value: "ALL", name: "全部" },
  { value: "GRFW", name: "个人服务" },
  { value: "FRFW", name: "法人服务" },
  { value: "ZWGK", name: "政务公开" },
  { value: "ZMHD", name: "政民互动" },
]

export const imHost = 'https://asueeer.com';
export const searchHost = 'http://10.13.56.36:8080';

export const welcomeMsg = '欢迎使用智能客服，请发送您的问题。';