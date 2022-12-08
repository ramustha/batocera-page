<template>
  <header>
    <div class="wrapper">
      <h1>Batocera! Game List</h1>
    </div>
  </header>

  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col lg="6" class="my-1">
        <b-form-group
            label="Platform"
            label-for="platform-select"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
        >
          <b-form-select
              id="platform-select"
              v-model="platformSelected"
              :options="platforms"
              :onchange="onPlatformChanged"
              size="sm"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-for="filter-input"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              placeholder="Type to Search"
            ></b-form-input>

            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col lg="6" class="my-1">
        <b-form-group
            label="Sort"
            label-for="sort-by-select"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
            v-slot="{ ariaDescribedby }"
        >
          <b-input-group size="sm">
            <b-form-select
                id="sort-by-select"
                v-model="sortBy"
                :options="sortOptions"
                :onchange="onSortByChanged"
                :aria-describedby="ariaDescribedby"
                class="w-75"
            >
            </b-form-select>

            <b-form-select
                v-model="sortDesc"
                :disabled="!sortBy"
                :onchange="onSortDescChanged"
                :aria-describedby="ariaDescribedby"
                size="sm"
                class="w-25"
            >
              <option :value="false">Asc</option>
              <option :value="true">Desc</option>
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col lg="6" class="my-1">
        <b-form-group
            v-model="sortDirection"
            label="Filter On"
            description="Leave all unchecked to filter on all data"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
            v-slot="{ ariaDescribedby }"
        >
          <b-form-checkbox-group
              v-model="filterOn"
              :aria-describedby="ariaDescribedby"
              class="mt-1"
          >
            <b-form-checkbox value="name">Name</b-form-checkbox>
            <b-form-checkbox value="publisher">Publisher</b-form-checkbox>
            <b-form-checkbox value="genre">Genre</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-col>

      <b-col sm="5" md="6" class="my-1">
        <b-form-group
            label="Per page"
            label-for="per-page-select"
            label-cols-sm="6"
            label-cols-md="4"
            label-cols-lg="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
        >
          <b-form-select
              id="per-page-select"
              v-model="perPage"
              :options="pageOptions"
              :onchange="onPerPageChanged"
              size="sm"
          ></b-form-select>
          <span class="text-info small">Total: <b>{{items.length}} game</b></span>
        </b-form-group>
      </b-col>
      <b-col sm="7" md="6" class="my-1" style="text-align: right">
        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
        ></b-pagination>
        <b-link @click="info(platformSelected, items, $event.target)">
          View in List
        </b-link>
      </b-col>
    </b-row>

    <!-- Main table element -->
    <b-table
        :items="items"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        :filter="filter"
        :filter-included-fields="filterOn"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :sort-direction="sortDirection"
        :busy="isBusy"
        sort-icon-left
        stacked="md"
        striped
        hover
        show-empty
        small
        @filtered="onFiltered"
    >
      <template #cell(index)="data">
        {{ (data.index + (perPage * (currentPage - 1))) + 1 }}
      </template>
      <template #cell(releasedate)="data">
        {{ data.value == 'Invalid date' ? '-' : data.value }}
      </template>
      <template #table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong> Loading...</strong>
        </div>
      </template>

      <template #cell(actions)="row">
        <b-button size="sm" @click="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template #row-details="row">
        <div style="display: flex;justify-content: center;">
          <b-card
            no-body
            style="max-width: 25rem;"
            img-top
          >
            <b-carousel
              id="carousel-fade"
              style="text-shadow: 0px 0px 2px #000; min-width: 260px; min-height: 320px;"
              fade
              controls
              indicators
            >
              <b-carousel-slide
                :img-src="getImageUrl(row.item.id, 'sstitle')"
              ></b-carousel-slide>
              <b-carousel-slide
                :img-src="getImageUrl(row.item.id, 'ss')"
              ></b-carousel-slide>
            </b-carousel>

            <b-card-body>
              <b-card-title>{{ row.item.name }}</b-card-title>
              <b-card-sub-title class="mb-2">{{ row.item.publisher || '-' }}</b-card-sub-title>
              <b-card-sub-title class="mb-2">{{ row.item.publisher || '-' }}</b-card-sub-title>
              <b-card-sub-title class="mb-2">{{ row.item.releasedate || '-' }}</b-card-sub-title>
              <b-card-sub-title class="mb-2">{{ row.item.genre || '-' }} <span class="float-right">{{ row.item.id || '-' }}</span></b-card-sub-title>
              <b-card-title>
                <b-row align-v="center" class="justify-content-md-center" style="padding: 0;" >
                  <div v-for="index in 5" :key="index">
                    <div v-if="((row.item.rating*100/20) > index)">
                      <b-col cols="2">
                        <b-icon icon="star-fill" font-scale="0.5"></b-icon>
                      </b-col>
                    </div>
                    <div v-else-if="((row.item.rating*100/20) % 1) > 0 && (row.item.rating*100/20) + 1 > index">
                      <b-col cols="2">
                        <b-icon icon="star-half" font-scale="0.5"></b-icon>
                      </b-col>
                    </div>
                    <div v-else>
                      <b-col cols="2">
                        <b-icon icon="star" font-scale="0.5"></b-icon>
                      </b-col>
                    </div>
                  </div>
                </b-row>
              </b-card-title>
              <b-card-text>
                {{ row.item.desc || '-' }}
              </b-card-text>
            </b-card-body>

            <b-list-group flush>
              <b-list-group-item class="text-center">Players: <b>{{ row.item.players || '-' }}</b></b-list-group-item>
              <b-list-group-item class="text-center">Region: <b>{{ row.item.region || '-' }}</b></b-list-group-item>
              <b-list-group-item class="text-center">Language: <b>{{ row.item.lang || '-'  }}</b></b-list-group-item>
              <b-list-group-item class="text-center">{{ row.item.path }}</b-list-group-item>
            </b-list-group>

          </b-card>
        </div>
      </template>
    </b-table>

    <!-- Info modal -->
    <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal" size="xl">
      <div style="margin: 5px">
        <b-row cols="2">
          <b-col v-for="item in items">✅{{ item.name.toUpperCase().substr(0, 35) }}</b-col>
        </b-row>
      </div>
    </b-modal>
  </b-container>
</template>

<script>
import axios from "axios";
import X2JS from "x2js";
import moment from "moment";

export default {
  data() {
    return {
      items: [],
      fields: [
        {key: 'index', label: 'No'},
        {key: 'name', label: 'Name', sortable: true},
        {key: 'region', label: 'Region', sortable: true, class: 'text-center'},
        {key: 'releasedate', label: 'Release', sortable: true, class: 'text-center'},
        {key: 'publisher', label: 'Publisher', sortable: true},
        {key: 'genre', label: 'Genre', sortable: true},
        {key: 'actions', label: 'Actions'}
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      pageOptions: [25, 50, {value: 1000, text: "Show a lot"}],
      sortBy: 'name',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      filterOn: ['name'],
      infoModal: {
        id: 'info-modal',
        title: '',
        content: ''
      },
      isBusy: true,
      platforms: [
        {
          label: 'Arcade',
          options: [
            {value: 'cave3rd', text: 'CAVE CV1000', platform: 'Arcade'},
            {value: 'daphne', text: 'DAPHNE (Laserdisc)', platform: 'Arcade'},
            {value: 'fbneo', text: 'FinalBurn Neo', platform: 'Arcade'},
            {value: 'gaelco', text: 'Gaelco', platform: 'Arcade'},
            {value: 'mame', text: 'MAME', platform: 'Arcade'},
            {value: 'neogeo', text: 'NEO•GEO MVS', platform: 'Arcade'},
            {value: 'atomiswave', text: 'Sammy Atomiswave', platform: 'Arcade'},
            {value: 'model2', text: 'Sega Model 2', platform: 'Arcade'},
            {value: 'model3', text: 'Sega Model 3', platform: 'Arcade'},
            {value: 'naomi', text: 'Sega NAOMI', platform: 'Arcade'},
            {value: 'naomi2', text: 'Sega NAOMI 2', platform: 'Arcade'},
            {value: 'hikaru', text: 'Sega Hikaru', platform: 'Arcade'},
            {value: 'triforce', text: 'Triforce', platform: 'Arcade'},
          ]
        },
        {
          label: 'Home console',
          options: [
            {value: '3do', text: '3DO Interactive', platform: 'Home console'},
            {value: 'advision', text: 'Adventure Vision', platform: 'Home console'},
            {value: 'apfm1000', text: 'APF-MP1000', platform: 'Home console'},
            {value: 'arcadia', text: 'Arcadia 2001', platform: 'Home console'},
            {value: 'amigacd32', text: 'Amiga CD32', platform: 'Home console'},
            {value: 'gx4000', text: 'Amstrad GX4000', platform: 'Home console'},
            {value: 'atari2600', text: 'Atari 2600/VCS', platform: 'Home console'},
            {value: 'atari5200', text: 'Atari 5200', platform: 'Home console'},
            {value: 'atari7800', text: 'Atari 7800', platform: 'Home console'},
            {value: 'jaguar', text: 'Atari Jaguar', platform: 'Home console'},
            {value: 'astrocde', text: 'Bally Astrocade', platform: 'Home console'},
            {value: 'pv1000', text: 'Casio PV-1000', platform: 'Home console'},
            {value: 'cdi', text: 'Compact Disc Interactive', platform: 'Home console'},
            {value: 'colecovision', text: 'ColecoVision', platform: 'Home console'},
            {value: 'amigacdtv', text: 'Commodore CDTV', platform: 'Home console'},
            {value: 'crvision', text: 'CreatiVision', platform: 'Home console'},
            {value: 'channelf', text: 'Fairchild Channel F', platform: 'Home console'},
            {value: 'fds', text: 'Family Computer Disk System', platform: 'Home console'},
            {value: 'intellivision', text: 'Intellivision', platform: 'Home console'},
            {value: 'lowresnx', text: 'Lowres', platform: 'Home console'},
            {value: 'odyssey2', text: 'Odyssey²', platform: 'Home console'},
            {value: 'pico8', text: 'PICO-8', platform: 'Home console'},
            {value: 'pcenginecd', text: 'PC Engine CD-ROM²', platform: 'Home console'},
            {value: 'supergrafx', text: 'PC Engine SuperGrafx', platform: 'Home console'},
            {value: 'pcengine', text: 'PC Engine/TurboGrafx-16', platform: 'Home console'},
            {value: 'videopacplus', text: 'Philips Videopac+', platform: 'Home console'},
            {value: 'xbox', text: 'Microsoft Xbox', platform: 'Home console'},
            {value: 'pcfx', text: 'NEC PC-FX', platform: 'Home console'},
            {value: 'neogeo', text: 'Neo Geo', platform: 'Home console'},
            {value: 'neogeocd', text: 'Neo Geo CD', platform: 'Home console'},
            {value: 'n64', text: 'Nintendo 64', platform: 'Home console'},
            {value: 'n64dd', text: 'Nintendo 64DD', platform: 'Home console'},
            {value: 'nes', text: 'Nintendo Entertainment System', platform: 'Home console'},
            {value: 'gamecube', text: 'Nintendo GameCube', platform: 'Home console'},
            {value: 'wii', text: 'Nintendo Wii', platform: 'Home console'},
            {value: 'wiiu', text: 'Nintendo Wii U', platform: 'Home console'},
            {value: 'satellaview', text: 'Satellaview', platform: 'Home console'},
            {value: 'sega32x', text: 'Sega 32X', platform: 'Home console'},
            {value: 'segacd', text: 'Sega CD/Mega CD', platform: 'Home console'},
            {value: 'megadrive', text: 'Sega Genesis/Mega Drive', platform: 'Home console'},
            {value: 'dreamcast', text: 'Sega Dreamcast', platform: 'Home console'},
            {value: 'mastersystem', text: 'Sega Master System', platform: 'Home console'},
            {value: 'saturn', text: 'Sega Saturn', platform: 'Home console'},
            {value: 'sg1000', text: 'Sega SG-1000', platform: 'Home console'},
            {value: 'socrates', text: 'Socrates', platform: 'Home console'},
            {value: 'psx', text: 'Sony PlayStation', platform: 'Home console'},
            {value: 'ps2', text: 'Sony PlayStation 2', platform: 'Home console'},
            {value: 'ps3', text: 'Sony PlayStation 3', platform: 'Home console'},
            {value: 'sufami', text: 'SuFami Turbo', platform: 'Home console'},
            {value: 'scv', text: 'Super Cassette Vision', platform: 'Home console'},
            {value: 'sgb', text: 'Super Game Boy', platform: 'Home console'},
            {value: 'supracan', text: 'Super A\'Can', platform: 'Home console'},
            {value: 'snes_msu1', text: 'Super NES CD-ROM', platform: 'Home console'},
            {value: 'tic80', text: 'TIC-80', platform: 'Home console'},
            {value: 'uzebox', text: 'Uzebox', platform: 'Home console'},
            {value: 'vsmile', text: 'V.Smile', platform: 'Home console'},
            {value: 'vectrex', text: 'Vectrex', platform: 'Home console'},
            {value: 'virtualboy', text: 'Virtual Boy', platform: 'Home console'},
            {value: 'wasm4', text: 'WASM4 fantasy console', platform: 'Home console'},
          ]
        },
        {
          label: 'Portable console',
          options: [
            {value: 'lynx', text: 'Atari Lynx', platform: 'Portable console'},
            {value: 'arduboy', text: 'Arduboy', platform: 'Portable console'},
            {value: 'gameandwatch', text: 'Game & Watch', platform: 'Portable console'},
            {value: 'gamate', text: 'Gamate', platform: 'Portable console'},
            {value: 'gb', text: 'Game Boy', platform: 'Portable console'},
            {value: 'gba', text: 'Game Boy Advance', platform: 'Portable console'},
            {value: 'gbc', text: 'Game Boy Color', platform: 'Portable console'},
            {value: 'gamegear', text: 'Game Gear', platform: 'Portable console'},
            {value: 'gmaster', text: 'Game Master', platform: 'Portable console'},
            {value: 'gamecom', text: 'Game.com', platform: 'Portable console'},
            {value: 'lcdgames', text: 'Handheld LCD Games', platform: 'Portable console'},
            {value: 'megaduck', text: 'Mega Duck/Cougar Boy', platform: 'Portable console'},
            {value: 'ngp', text: 'Neo Geo Pocket', platform: 'Portable console'},
            {value: 'ngpc', text: 'Neo Geo Pocket Color', platform: 'Portable console'},
            {value: '3ds', text: 'Nintendo 3DS', platform: 'Portable console'},
            {value: 'nds', text: 'Nintendo DS', platform: 'Portable console'},
            {value: 'switch', text: 'Nintendo Switch', platform: 'Portable console'},
            {value: 'pokemini', text: 'Pokémon Mini', platform: 'Portable console'},
            {value: 'psp', text: 'PlayStation Portable', platform: 'Portable console'},
            {value: 'psvita', text: 'PlayStation Vita', platform: 'Portable console'},
            {value: 'wswan', text: 'WonderSwan', platform: 'Portable console'},
            {value: 'wswanc', text: 'WonderSwan Color', platform: 'Portable console'},
          ]
        }
      ],
      platformSelected: 'mame'
    }
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      return this.fields
          .filter(f => f.sortable)
          .map(f => {
            return {text: f.label, value: f.key}
          })
    }
  },
  mounted() {
    this.platformSelected = localStorage.getItem('platformSelected') || this.platformSelected
    this.perPage = localStorage.getItem('perPage') || this.perPage
    this.sortBy = localStorage.getItem('sortBy') || this.sortBy
    this.sortDesc = localStorage.getItem('sortDesc') || this.sortDesc

    this.fetchData()
  },
  methods: {
    async fetchData() {
      const baseURL = 'https://raw.githubusercontent.com/ramustha/batocera/main/';
      axios.get(baseURL + this.platformSelected + '-gamelist.xml')
        .then(response => {
          const x2js = new X2JS();
          const document = x2js.xml2js(response.data);
          console.log(document.gameList);
          this.items = document.gameList.game.map((game) => {
            return {
              'id':game._id,
              'path':game.path,
              'name':game.name,
              'desc':game.desc,
              'image':game.image,
              'marquee':game.marquee,
              'thumbnail':game.thumbnail,
              'releasedate': moment(game.releasedate, 'YYYYMMDDTHHmmss').format('YYYY'),
              'players':game.players,
              'developer':game.developer,
              'publisher':game.publisher,
              'genre':game.genre,
              'lang':game.lang,
              'region':game.region,
              'rating':game.rating,
              'platform': this.platformSelected
            }
          }).filter(function (game) {
            return !game.name.includes('[DLC]')
              && !game.name.includes('ZZZ(notgame)')
          }).filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.name === value.name
              ))
          ).sort(function(a, b) {
            return a.name.localeCompare(b.name)
          })
          this.isBusy = false
          this.totalRows = this.items.length
          this.currentPage = localStorage.getItem('currentPage') || this.currentPage
        })
        .catch(error => {
          this.items = [];
          this.isBusy = false
          this.totalRows = this.items.length
        });
    },
    info(title, content, button) {
      this.infoModal.title = title
      this.infoModal.content = content
      this.$root.$emit('bv::show::modal', this.infoModal.id, button)
    },
    resetInfoModal() {
      this.infoModal.title = ''
      this.infoModal.content = ''
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1

      localStorage.setItem('currentPage', this.currentPage)
    },
    onPlatformChanged(e) {
      this.isBusy = true;
      this.platformSelected = e.target.value
      localStorage.setItem('currentPage', '1')
      localStorage.setItem('platformSelected', this.platformSelected)

      this.fetchData()
    },
    onSortByChanged(e) {
      localStorage.setItem('sortBy', e.target.value)
    },
    onSortDescChanged(e) {
      localStorage.setItem('sortDesc', e.target.value)
    },
    onPerPageChanged(e) {
      localStorage.setItem('perPage', e.target.value)
    },
    getImageUrl(imageId, media) {
      return `https://www.screenscraper.fr/image.php?gameid=${imageId}&media=${media}&hd=0&region=wor&num=&version=&maxwidth=720&maxheight=360`
    }
  },
  watch: {
    currentPage: {
      handler: function(newValue){
        localStorage.setItem('currentPage', newValue)
      }
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
