export interface Reference {
  /** Authors and year, up to the title. */
  lead: string
  title: string
  /** Journal name in italics, then volume in italics. */
  journal?: string
  volume?: string
  rest?: string
  url: string
}

/** APA references. They stay in English in both languages. */
export const REFERENCES: Reference[] = [
  {
    lead: 'Borritz, M., Rugulies, R., Bjorner, J. B., Villadsen, E., Mikkelsen, O. A., & Kristensen, T. S. (2006).',
    title: 'Burnout among employees in human service work: Design and baseline findings of the PUMA study.',
    journal: 'Scandinavian Journal of Public Health',
    volume: '34',
    rest: '(1), 49-58.',
    url: 'https://doi.org/10.1080/14034940510032275',
  },
  {
    lead: 'Kristensen, T. S., Borritz, M., Villadsen, E., & Christensen, K. B. (2005).',
    title: 'The Copenhagen Burnout Inventory: A new tool for the assessment of burnout.',
    journal: 'Work & Stress',
    volume: '19',
    rest: '(3), 192-207.',
    url: 'https://doi.org/10.1080/02678370500297720',
  },
  {
    lead: 'Maslach, C., & Leiter, M. P. (2016).',
    title: 'Understanding the burnout experience: Recent research and its implications for psychiatry.',
    journal: 'World Psychiatry',
    volume: '15',
    rest: '(2), 103-111.',
    url: 'https://doi.org/10.1002/wps.20311',
  },
  {
    lead: 'World Health Organization. (2019, May 28).',
    title: 'Burn-out an "occupational phenomenon": International Classification of Diseases.',
    url: 'https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases',
  },
]
