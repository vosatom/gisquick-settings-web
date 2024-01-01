export const extent = [1333170, 6180839, 2125985, 6616409]
export const initial_extent = [1600682, 6456591, 1611485, 6463853]

export const description = `<div class="col-md-12 mapa-obsah-panelu txt">
<div>
  Mapa Městem na kole – nejchytřejší a nejdetailnější mapa pro cyklistickou dopravu
<h3>Základní legenda:</h3>
<table id="legenda_table">
<tbody><tr><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/cyklotrasa.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/trasa-budouci-mestska.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/trasa-prakticka-jina.png">
</td><td>
Značená, neznačená, praktická trasa
</td></tr>
<tr><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/zadny-provoz.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/horsi-povrch.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/spatny-povrch.png">
</td><td>
Hladký, nerovný, velmi špatný povrch
</td></tr>
<tr><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/zadny-provoz.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/slaby-provoz.png">
</td><td>
<img src="https://s3-eu-west-1.amazonaws.com/cyklomapa-media/mala_legenda/silny-provoz.png">
</td><td>
Žádný, slabý, silný provoz
</td></tr>
</tbody></table>
<a href="#legenda">Více značek (complete legend)</a>

<h3>Cyklomapa Městem na kole:</h3>
<ul>
<li>Vyhledá 3 nejvhodnější alternativy vaší trasy</li>
<li>Zobrazuje podrobnosti z terénu, stoupání, povrch tras, dočasné uzavírky, zimní omezení, tipy cyklistů na zlepšení infrastruktury, leteckou mapu aj.</li>
<li>Zobrazí leteckou mapu</li>
<li>Upozorní na uzavírky a zimní omezení</li>
<li>Obsahuje mapu podnětů na cykloopatření</li>
<li>Zvětší vybranou oblast pomocí shift+tažení myší, nebo kolečka.</li>
</ul>
</div>
</div>`

export const legendItems = {
  nodes: [
    {
      title: '',
      symbols: [
        {
          title: 'Ulice s provozem',
          description: 'Heavy traffic',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/silny-provoz.png',
          extra_description:
            'Komunikace, na kterých se předpokládá živý nebo silný provoz (v Open Street Map všechny komunikace od tertiary výše).',
        },
        {
          title: 'Klidná nebo zklidněná ulice',
          description: 'Light traffic',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/slaby-provoz.png',
          extra_description:
            'Komunikace se slabým nebo zklidněným automobilovým provozem. Vedlejší ulice, zóny 30, obytné zóny, účelové komunikace, apod. Provoz aut není vyloučen, ale je mírný a běžné cyklisty neomezuje.',
        },
        {
          title: 'Žádný provoz',
          description: 'No traffic, paved surface',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/zadny-provoz.png',
          extra_description:
            'Komunikace s vyloučením běžného automobilového provozu. Cyklostezky, cesty se zákazem vjezdu motorových vozidel, lesní a parkové cesty, chodníky.',
        },
        {
          title: 'Zhoršený povrch',
          description: 'Unpaved, slightly uneven surface',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/horsi-povrch.png',
          extra_description:
            'Povrch horší než asfalt, ale sjízdný na běžném kole. Lesní cesty se zhutněným povrchem, dlažba, apod.',
        },
        {
          title: 'Velmi špatný povrch',
          description: 'Very uneven surface',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/spatny-povrch.png',
          extra_description:
            'Velmi nerovný povrch, obtížně sjízdné kočičí hlavy, nezpevněné cesty a pěšiny, za mokra bahnité, zpevněný povrch ve velmi špatném stavu (extrémní výtluky), apod.',
        },
        {
          title: 'Značená cyklotrasa',
          description: 'Marked route',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/cyklotrasa.png',
          extra_description:
            'Cyklotrasa značená v terénu. Trasa městského systému, kromě toho fragmenty starých cyklotras KČT nebo místních, Greenwaye, apod.',
        },
        {
          title: 'Praktická trasa v koridoru městské cyklotrasy',
          description: 'Practical route - possibly marked in the future',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/trasa-budouci-mestska.png',
          extra_description:
            'Praktický průjezd, použitelná trasa. Číslo odpovídá číslu trasy městského systému, která by v budoucnu měla být vedena zhruba těmito místy.',
        },
        {
          title: 'Jiná praktická trasa',
          description: 'Practical route - Prahou na kole',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/trasa-prakticka-jina.png',
          extra_description:
            'Praktická trasa. Číslo je někdy blízké trase městského systému vedené nebo plánované v okolí. Někdy alternativa k trase městského systému.',
        },
        {
          title: 'Cyklopruh',
          description: 'Bicycle lane',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/cyklopruh.png',
          extra_description:
            'Vyhrazený pruh pro cyklisty. Kreslí se při té straně komunikace, při které je realizován.',
        },
        {
          title: 'Piktokoridor',
          description: 'Sharrows',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/piktokoridor.png',
          extra_description:
            'Piktogramový koridor vyjadřuje doporučený průjezd cyklistů.',
        },
        {
          title: 'Pruh bus+cyklo (+taxi)',
          description: 'Bus + bicycle shared lane',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/bus-cyklo.png',
          extra_description:
            'Vyhrazený pruh pro autobusy a jízdní kola, může být také pro vozy taxi.',
        },
        {
          title: 'Cyklisté v protisměru',
          description: 'Oneway street with bicycle contraflow',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/cykloobousmerka_1.png',
          extra_description:
            'Jednosměrná ulice s obousměrnou jízdou cyklistů. (Cyklisté ve směru fialové šipky.)',
        },
        {
          title: 'Zákaz vjezdu cyklistů',
          description: 'Riding bicycles prohibited',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/zakaz-cyklo.png',
          extra_description:
            'Zákaz vjezdu cyklistů. Buď silnice pro motorová vozidla, komunikace se zákazem vjezdu nebo komunikace se zákazem vjezdu všech vozidel. Výjimečně tak mohou být takto označeny i komunikace, kde je vjezd cyklistů tolerován.',
        },
        {
          title: 'Vjezd jen pro dopravní obsluhu',
          description: 'Only destination traffic allowed',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/dopravni-obsluha.png',
          extra_description:
            'Vjezd povolen pouze dopravní obsluze. Zpravidla to znamená toleranci vjezdu cyklistů, v některých případech zde vede i značená trasa.',
        },
        {
          title: 'Dlažba, kočičí hlavy',
          description: 'Rough paved surface - big setts or cobblestones',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/dlazba.png',
          extra_description: 'Dlážděné ulice, běžná dlažba nebo kočičí hlavy.',
        },
        {
          title: 'Chodník, cesta pro pěší',
          description: 'Sidewalk or pedestrian path',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/chodnik-neznaceny.png',
          extra_description: 'Chodník, cesta pro pěší.',
        },
        {
          title: 'Stoupání',
          description: 'Inclined street',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/stoupani.png',
          extra_description:
            'Znatelné stoupání. Stav odpovídá značení v OSM, nejsou tak značeny všechny ulice. V Praze jsme vyznačili ulice, kde o přítomnosti stoupání považujeme za vhodné informovat cyklisty.',
        },
        {
          title: 'Prudké stoupání / klesání',
          description: 'Street with steep incline',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/strme-stoupani.png',
          extra_description:
            'Strmé stoupání nebo nebezpečné klesání. Zpravidla jde o stoupání se sklonem nad 8-10%, ale přesný údaj zpravidla není k dispozici.',
        },
        {
          title: 'Pěší zóna bez cyklistů',
          description: 'Pedestrian zone - cycling not allowed',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/pesi-zona.png',
          extra_description: 'Pěší zóna bez povolené jízdy cyklistů',
        },
        {
          title: 'Zóna pro pěší a cyklisty',
          description: 'Pedestrian zone - cycling allowed',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/pesi-zona-cyklo.png',
          extra_description: 'Zóna pro pěší s poovleným průjezdem cyklistů',
        },
        {
          title: 'Přejezd pro cyklisty',
          description: 'Bicycle crossing',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/prejezd.png',
          extra_description:
            'Přejezd pro cyklisty, ať sdružený s přechodem nebo samostatný.',
        },
        {
          title: 'Zpomalovací prvek',
          description: 'Traffic calming hump',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/retardera.png',
          extra_description:
            'Zpomalovací prahy, hupy, koláče a jiné prvky dopravního zklidňování.',
        },
        {
          title: 'Předsunutá stopčára; přechod pro pěší',
          description: 'Advanced stop line; Pedestrian crossing',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/predsunute-prechod.png',
          extra_description:
            'Předsunutá stiopčára pro cyklisty; Přechod pro chodce. Stav odpovídá zmapování v OSM.',
        },
        {
          title: 'Praktická trasa po chodníku',
          description: 'Practical route on sidewalk',
          icon: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/ikony/chodnik.png',
          extra_description:
            'Praktický průjezd vedený po chodníku. Na chodníku buďte maximálně ohleduplní.',
        },
      ],
    },
  ],
  title: '',
}

export const bookmarks = [
  {
    id: 'prague',
    rotation: 0,
    name: 'Praha',
    extent: [
      14.379171056150037, 50.059525511730726, 14.476216056293469,
      50.10138796375011,
    ],
    content:
      '<div><p>Obsah mapy spravuje <a href="https://mestemnakole.cz/" target="_blank">Městem na kole</a> (<a href="mailto:redakce@mestemnakole.cz">redakce@mestemnakole.cz</a>), spolupráce <a href="http://cyklistesobe.cz/" target="_blank">Cyklisté sobě</a> a <a href="http://www.auto-mat.cz/" target="_blank">AutoMat</a>.</p><p>Mapy pro Android: <a href="http://prahounakole.cz/2012/09/nase-cyklomapa-v-mobilu/" target="_blank">mapa pro Locus v mobilu offline</a>.</p></div>',
  },
  {
    id: 'breclav',
    name: 'Břeclav',
    rotation: 0,
    extent: [
      16.80530548095703, 48.71973471841844, 16.95465087890625,
      48.790354558689785,
    ],
  },
  {
    id: 'brno',
    name: 'Brno',
    rotation: 0,
    extent: [
      16.340274194077857, 48.99809975096625, 16.945895531881167,
      49.3974296281676,
    ],
    content:
      '<h3>Vítejte v Krně!</h3><p>Hlavičky si nevšímejte, to je krycí manévr, aby nás nenašli.</p>',
  },
  {
    id: 'budejovice',
    name: 'České Budějovice',
    rotation: 0,
    extent: [
      14.332522729513839, 48.86294787992182, 14.59344802244605,
      49.06760793718135,
    ],
    content:
      'Mapu pro České Budějovice spravuje občanské sdružení CykloBudějovice, o.s., hlavní pořadatel kampaně Do práce na kole v Českých Budějovicích. Veškeré podněty, fotografie nebo názory prosím posílejte na cyklo.budejovice@gmail.com.<br/>Pokud máte zájem zapojit se do FB skupiny CykloBudějovice, můžete zde: <a href="https://www.facebook.com/cyklocb">https://www.facebook.com/cyklocb</a> <br/><br/>Děkujeme!',
  },
  {
    id: 'decin',
    name: 'Děčín',
    rotation: 0,
    extent: [
      14.129275659236487, 50.71562959334935, 14.281710961950129,
      50.8233268726718,
    ],
  },
  {
    id: 'hradec',
    name: 'Hradec Králové',
    rotation: 0,
    extent: [
      15.642642358234918, 50.11797541767061, 16.071109155056433,
      50.349880843152846,
    ],
  },
  {
    id: 'jablonec',
    name: 'Jablonec nad Nisou',
    rotation: 0,
    extent: [
      14.942263940372868, 50.67300343527387, 15.227908471580335,
      50.824194391425095,
    ],
  },
  {
    id: 'jihlava',
    name: 'Jihlava',
    rotation: 0,
    extent: [
      15.45175490709244, 49.31943284605063, 15.734652856270877,
      49.49278928641343,
    ],
  },
  {
    id: 'jindrichuv-hradec',
    name: 'Jindřichův Hradec',
    rotation: 0,
    extent: [
      14.90655837396504, 49.08645242258203, 15.095385888591744,
      49.205927915439446,
    ],
  },
  {
    id: 'karvina',
    name: 'Karviná',
    rotation: 0,
    extent: [
      18.037318566396756, 49.73002099673539, 18.644313195222672,
      49.97970205303642,
    ],
  },
  {
    id: 'liberec',
    name: 'Liberec',
    rotation: 0,
    extent: [
      14.95599685052275, 50.67474403678304, 15.211428979392322,
      50.82245933780004,
    ],
    content: 'Obsah mapy Libercem na kole vznikl za podpory Nadace Via',
  },
  {
    id: 'olomouc',
    name: 'Olomouc',
    rotation: 0,
    extent: [
      17.14090285607286, 49.50652434718438, 17.368869164633562,
      49.66411172022481,
    ],
    content:
      'Mapu pro Olomouc spravuje občanské sdružení KOLOMOUC, o.s., hlavní pořadatel kampaně Do práce na kole v Olomouci. Veškeré podněty, fotografie nebo názory prosím posílejte na kolomouc@gmail.com. Pokud máte zájem zapojit se do FB skupiny Kolomouce, můžete zde: https://www.facebook.com/groups/108207639334402/<br/><br/>Děkujeme!<br/>',
  },
  {
    id: 'opava',
    name: 'Opava',
    rotation: 0,
    extent: [
      17.74961409866861, 49.84284708536768, 18.022899010740073,
      50.02582227327221,
    ],
  },
  {
    id: 'ostrava',
    name: 'Ostrava',
    rotation: 0,
    extent: [
      17.982730248541163, 49.67744319008557, 18.60826430607135,
      49.98482519195471,
    ],
    content:
      'Tuto mapu pro Vás upravuje OSTRAVOUNAKOLE, o.s.<br/>Chybí Vám v mapě nějaké značky, problémová místa, doporučené trasy? Napište na e-mail: michal@ostravounakole.cz<br/>www.ostravounakole.cz<br/>FB ostravounakole.cz',
  },
  {
    id: 'otrokovice',
    name: 'Otrokovice',
    rotation: 0,
    extent: [
      17.42895064656848, 49.1412852169523, 17.77433333695016, 49.27586226384378,
    ],
  },
  {
    id: 'pardubice',
    name: 'Pardubice',
    rotation: 0,
    extent: [
      15.615176537926054, 49.97246142082392, 15.892581323044467,
      50.1267802723394,
    ],
  },
  {
    id: 'plzen',
    name: 'Plzeň',
    rotation: 0,
    extent: [
      13.214663842951092, 49.62373954246047, 13.544253686655418,
      49.85980506802622,
    ],
  },
  {
    id: 'prerov',
    name: 'Přerov',
    rotation: 0,
    extent: [
      17.379855492762506, 49.411012720257986, 17.53091750446561,
      49.51633274857886,
    ],
  },
  {
    id: 'hradiste',
    name: 'Uherské Hradiště',
    rotation: 0,
    extent: [
      17.37985549276249, 49.01242348171073, 17.528170922429346,
      49.10196597726798,
    ],
  },
  {
    id: 'usti',
    name: 'Ústí nad Labem',
    rotation: 0,
    extent: [
      13.923282006910272, 50.59635305841326, 14.115542749071276,
      50.71562959334935,
    ],
  },
  {
    id: 'zlin',
    name: 'Zlín',
    rotation: 0,
    extent: [
      17.43049559895315, 49.150717534882716, 17.795962670435628,
      49.26813400854431,
    ],
  },
]
