import Search from './modules/search'

let search = new Search()
// search.settingValue = 'Anyong'
search.simpleChangeValue('AnyongHaseyo')
let text = search.gettingValue
search.getAimedAlert(text)