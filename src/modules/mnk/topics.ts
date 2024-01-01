export const allTopics = [
  'testovací',
  'základní-mapa',
  'mapa-uzavírek',
  'letecké-snímky',
  'městská-mapa',
  'zimní-údržba',
  'dopravní-heatmapa',
  'cykloopatření',
  'podniky-a-servisy',
]

export const topics = {
  'Základní mapa': {
    id: 'základní-mapa',
    title: 'Základní mapa',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_zakladni.png',
    base_layer: 'P',
    visible_overlays: [
      'mnk_poi_trasy_informace',
      'mnk_poi_cyklopodniky',
      'mnk_poi_fotografie_tras',
      'mnk_poi_stojany_uschova_kol',
      'mnk_poi_verejna_doprava',
      'mnk_poi_problemy_infrastruktura',
      'mnk_poi_uzavirky',
    ],

    abstract:
      'Cyklomapa od Prahou na kole. Podklad zvýrazňující cyklotrasy, klikací značky s místy, o kterých se vám hodí vědět při běžné jízdě na kole.',
  },
  'Mapa uzavírek': {
    id: 'mapa-uzavírek',
    title: 'Mapa uzavírek',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_uzavirky.png',
    base_layer: 'W',
    visible_overlays: ['mnk_poi_uzavirky'],
    abstract:
      'Mapa zvýrazňující uzavírky a evidovaná dopravní omezení, případně nedávno otevřené uzavírky. Dozvíte-li se o uzavírce, která není v mapě, dejte prosím vědět místním správcům mapy.\n\nV zimě by v této vrstvě měla být zapnutá také vrstva zimní údržby.',
  },
  'Letecké snímky': {
    id: 'letecké-snímky',
    title: 'Letecké snímky',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_ortofoto.jpg',
    base_layer: 'G',
    visible_overlays: [
      'mnk_poi_trasy_informace',
      'mnk_poi_cyklopodniky',
      'mnk_poi_fotografie_tras',
      'mnk_poi_stojany_uschova_kol',
      'mnk_poi_verejna_doprava',
      'mnk_poi_problemy_infrastruktura',
      'mnk_poi_uzavirky',
    ],
    abstract:
      'Standardní značky cyklomapy nad leteckými snímky Google. Mapu lze v tomto režimu přiblížit ještě o další dva stupně zvětšení.',
  },
  'Městská mapa': {
    id: 'městská-mapa',
    title: 'Městská mapa',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_osm.png',
    base_layer: 'O',
    visible_overlays: [
      'mnk_poi_trasy_informace',
      'mnk_poi_cyklopodniky',
      'mnk_poi_fotografie_tras',
      'mnk_poi_stojany_uschova_kol',
      'mnk_poi_verejna_doprava',
      'mnk_poi_problemy_infrastruktura',
      'mnk_poi_uzavirky',
    ],
    abstract:
      'Klikací značky cyklomapy nad klasickým městským podkladem OpenStreetMap.',
  },
  'Zimní údržba': {
    id: 'zimní-údržba',
    title: 'Zimní údržba',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/zimni_Bkam07V.jpg',
    base_layer: 'W',
    visible_overlays: ['i'],
    // "i"
    abstract:
      'Mapa zvýrazňující stav sjízdnosti cyklotras v zimě. Mimo zimní období nejsou značky aktivní.',
  },
  'Dopravní heatmapa': {
    id: 'dopravní-heatmapa',
    title: 'Dopravní heatmapa',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_heatmapa.png',
    base_layer: 'W',
    visible_overlays: ['t2023'],
    abstract:
      '"Heatmapa" zobrazující frekvenci používání tras. Trasy jsou z kampaně Do práce na kole 2015, buď předem naklikané (modře) nebo zaznamenané mobilní aplikací (červeně).',
  },
  Cykloopatření: {
    id: 'cykloopatření',
    title: 'Cykloopatření',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_cykloopatreni.png',
    base_layer: 'W',
    visible_overlays: ['c'],
    abstract:
      '"Cykloaktivistická" mapa. Místa, kde byly podány podněty na zlepšení, nebo kde je třeba zlepšit podmínky pro jízdu na kole.',
  },
  'Podniky a servisy': {
    id: 'podniky-a-servisy',
    title: 'Podniky a servisy',
    thumbnail_url:
      'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/preset_icons/preset_servisy.png',
    base_layer: 'O',
    visible_overlays: ['mnk_poi_cyklopodniky'],
    abstract:
      'Mapa s výběrem cykloservisů a jiných podniků spojených s cyklistikou (půjčovny kol, apod.).',
  },
}
