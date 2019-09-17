import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import Refresh from '@/components/refresh'
import './index.less'

const { screenHeight, screenWidth } = Taro.getSystemInfoSync()

const rpx2pxRate = 750 / screenWidth

function px2rpx(px: number): number {
  return px * rpx2pxRate
}

function api() {
  const total = 132
  return (page: number = 1, pageSize: number = 10) => {
    let num = pageSize
    const arr: { id: number }[] = []
    if(page * pageSize > total) {
      num = Math.max(0, total - (page - 1) * pageSize)
    }
    for(let i = 0; i < num; i++) {
      arr.push({ id: i + (page - 1) * pageSize })
    }
    return new Promise(resolve => {
      setTimeout(() => resolve({ total, list: arr }), 500)
    })
  }
}

const colors = [
  '#FAD344',
  '#FFB034',
  '#FA7744',
  '#E44848',
  '#C63030',
  '#E46094',
  '#AFA9FF',
  '#9760E4',
  '#5255CF',
  '#425188',
  '#3476EA',
  '#3FA0FF',
  '#80CEF6',
  '#3ECBCB',
  '#8ADB72',
  '#30BB6C',
  '#58BC4C',
  '#1D9D54',
  '#CFBD5C',
  '#9C8248',
]

const listApi = api()

interface Index {
  state: {
    refreshing: boolean,
    hasMore: boolean,
    list: any[]
  }
}

class Index extends Component {
  config: Config = {
    navigationBarTitleText: '首页',
    disableScroll: true
  }
  data = {
    refreshing: false,
    hasMore: false,
    list: [],
  }
  page = 1
  constructor(props) {
    super(props)
    this.state = this.data
  }
  componentDidMount() {
    this.handleRefresh()
  }
  getList(page:number = 1) {
    return listApi(page)
  }
  async handleLoadMore() {
    const { list } = this.state
    const { list: nextList, total } = await this.getList(++this.page) as any
    this.setState({
      list: [...list, ...nextList]
    }, () => this.hasMore(total))
  }
  async handleRefresh() {
    this.setState({
      refreshing: true
    })
    const { list, total } = await this.getList() as any
    this.setState({
      list,
      refreshing: false
    }, () => this.hasMore(total))
  }
  hasMore(total: number) {
    if(total > this.state.list.length) {
      this.setState({
        hasMore: true
      })
    } else {
      this.setState({
        hasMore: false
      })
    }
  }
  render () {
    return (
      <Refresh
        onLoadMore={this.handleLoadMore.bind(this)}
        onRefresh={this.handleRefresh.bind(this)}
        refreshing={this.state.refreshing}
        hasMore={this.state.hasMore}
        scrollViewHeight={px2rpx(screenHeight)}
      >
        {
          this.state.list.map(item => <View key={`list-${item.id}`} className="list-item" style={{ background: colors[item.id % 20]}}></View>)
        }
      </Refresh>
    )
  }
}

export default Index
