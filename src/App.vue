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
                :aria-describedby="ariaDescribedby"
                class="w-75"
            >
            </b-form-select>

            <b-form-select
                v-model="sortDesc"
                :disabled="!sortBy"
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
              size="sm"
          ></b-form-select>
        </b-form-group>
      </b-col>

      <b-col sm="7" md="6" class="my-1">
        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
        ></b-pagination>
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
        {{ data.index + 1 }}
      </template>
      <template #table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong> Loading...</strong>
        </div>
      </template>

      <template #cell(actions)="row">
        <!--          <b-button size="sm" @click="info(row.item, row.index, $event.target)" class="mr-1">-->
        <!--            Info modal-->
        <!--          </b-button>-->
        <b-button size="sm" @click="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template #row-details="row">
        <b-card>
          <ul style="list-style-type: none;">
            <li v-for="(value, key) in row.item" :key="key">
              <b-row class="mb-2">
                <b-col sm="2" class="text-sm-right"><b>{{ key }}:</b></b-col>
                <b-col>{{ value }}</b-col>
              </b-row>
            </li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <!-- Info modal -->
    <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
      <pre>{{ infoModal.content }}</pre>
    </b-modal>
  </b-container>
</template>

<script>
import axios from "axios";
import X2JS from "x2js";

export default {
  data() {
    return {
      items: [],
      fields: [
        {key: 'index', label: 'No'},
        {key: 'name', label: 'Name', sortable: true},
        {key: 'region', label: 'Region', sortable: true},
        {key: 'publisher', label: 'Publisher', sortable: true},
        {key: 'genre', label: 'Genre', sortable: true},
        {key: 'actions', label: 'Actions'}
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 50, {value: 100, text: "Show a lot"}],
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
            {value: 'mame', text: 'Multiple Arcade Machine Emulator', platform: 'Arcade'},
            {value: 'fbneo', text: 'FinalBurn Neo', platform: 'Arcade'},
            {value: 'daphne', text: 'DAPHNE (Laserdisc)', platform: 'Arcade'},
            {value: 'neogeo', text: 'NEO•GEO MVS', platform: 'Arcade'},
            {value: 'model1', text: 'Sega Model 1', platform: 'Arcade'},
            {value: 'model2', text: 'Sega Model 2', platform: 'Arcade'},
            {value: 'model3', text: 'Sega Model 3', platform: 'Arcade'},
            {value: 'naomi', text: 'Sega NAOMI', platform: 'Arcade'},
            {value: 'gaelco', text: 'Gaelco', platform: 'Arcade'},
            {value: 'hikaru', text: 'Sega Hikaru', platform: 'Arcade'},
            {value: 'naomi2', text: 'Sega NAOMI 2', platform: 'Arcade'},
            {value: 'triforce', text: 'Triforce', platform: 'Arcade'},
            {value: 'atomiswave', text: 'Sammy Atomiswave', platform: 'Arcade'},
            {value: 'cave3rd', text: 'CAVE CV1000/CV1000-B/CV1000-D/3rd/SH-3', platform: 'Arcade'},
          ]
        },
        {
          label: 'Home console',
          options: [
            {value: 'channelf', text: 'Fairchild Channel F', platform: 'Home console'},
            {value: 'atari2600', text: 'Atari 2600/VCS', platform: 'Home console'},
            {value: 'odyssey2', text: 'Odyssey²', platform: 'Home console'},
            {value: 'astrocde', text: 'Bally Astrocade/Arcade/ABA-1000', platform: 'Home console'},
            {value: 'apfm1000', text: 'APF-MP1000/MP-1000/M-1000', platform: 'Home console'},
            {value: 'intellivision', text: 'Tntellivision', platform: 'Home console'},
            {value: 'atari5200', text: 'Atari 5200', platform: 'Home console'},
            {value: 'colecovision', text: 'ColecoVision', platform: 'Home console'},
            {value: 'advision', text: 'Adventure Vision', platform: 'Home console'},
            {value: 'vectrex', text: 'Vectrex', platform: 'Home console'},
            {value: 'crvision', text: 'CreatiVision', platform: 'Home console'},
            {value: 'arcadia', text: 'Arcadia 2001/et al.', platform: 'Home console'},
            {value: 'nes', text: 'Nintendo Entertainment System', platform: 'Home console'},
            {value: 'sg1000', text: 'Sega SG-1000/SG-1000 II/SC-3000', platform: 'Home console'},
            {value: 'videopacplus', text: 'Philips Videopac+ G7400/G7420', platform: 'Home console'},
            {value: 'pv1000', text: 'Casio PV-1000/ぴーぶいせん/Pi Bui-Sen', platform: 'Home console'},
            {value: 'scv', text: 'Super Cassette Vision', platform: 'Home console'},
            {value: 'mastersystem', text: 'Sega Master System/Mark III', platform: 'Home console'},
            {value: 'fds', text: 'Family Computer Disk System/Famicom', platform: 'Home console'},
            {value: 'atari7800', text: 'Atari 7800', platform: 'Home console'},
            {value: 'socrates', text: 'Socrates', platform: 'Home console'},
            {value: 'pcengine', text: 'PC Engine/TurboGrafx-16', platform: 'Home console'},
            {value: 'megadrive', text: 'Sega Genesis/Mega Drive', platform: 'Home console'},
            {value: 'pcenginecd', text: 'PC Engine CD-ROM²/TurboGrafx-CD', platform: 'Home console'},
            {value: 'supergrafx', text: 'PC Engine SuperGrafx/SuperGrafx', platform: 'Home console'},
            {value: 'neogeo', text: 'Neo Geo', platform: 'Home console'},
            {value: 'cdi', text: 'Compact Disc Interactive/CD-i', platform: 'Home console'},
            {value: 'amigacdtv', text: 'Commodore CDTV', platform: 'Home console'},
            {value: 'gx4000', text: 'Amstrad GX4000', platform: 'Home console'},
            {value: 'segacd', text: 'Sega CD/Mega CD', platform: 'Home console'},
            {value: 'snes_msu-1', text: 'Super NES CD-ROM/SNES MSU-1', platform: 'Home console'},
            {value: 'sgb', text: 'Super Game Boy', platform: 'Home console'},
            {value: 'supracan', text: 'Super A\'Can', platform: 'Home console'},
            {value: 'jaguar', text: 'Atari Jaguar', platform: 'Home console'},
            {value: '3do', text: '3DO Interactive', platform: 'Home console'},
            {value: 'amigacd32', text: 'Amiga CD32', platform: 'Home console'},
            {value: 'sega32x', text: 'Sega 32X', platform: 'Home console'},
            {value: 'psx', text: 'Sony PlayStation', platform: 'Home console'},
            {value: 'pcfx', text: 'NEC PC-FX', platform: 'Home console'},
            {value: 'neogeocd', text: 'Neo Geo CD', platform: 'Home console'},
            {value: 'saturn', text: 'Sega Saturn', platform: 'Home console'},
            {value: 'virtualboy', text: 'Virtual Boy', platform: 'Home console'},
            {value: 'satellaview', text: 'Satellaview', platform: 'Home console'},
            {value: 'sufami', text: 'SuFami Turbo', platform: 'Home console'},
            {value: 'n64', text: 'Nintendo 64', platform: 'Home console'},
            {value: 'dreamcast', text: 'Sega Dreamcast', platform: 'Home console'},
            {value: 'n64dd', text: 'Nintendo 64DD', platform: 'Home console'},
            {value: 'ps2', text: 'Sony PlayStation 2', platform: 'Home console'},
            {value: 'gamecube', text: 'Nintendo GameCube', platform: 'Home console'},
            {value: 'xbox', text: 'Microsoft Xbox', platform: 'Home console'},
            {value: 'vsmile', text: 'V.Smile', platform: 'Home console'},
            {value: 'wii', text: 'Nintendo Wii', platform: 'Home console'},
            {value: 'ps3', text: 'Sony PlayStation 3', platform: 'Home console'},
            {value: 'wiiu', text: 'Nintendo Wii U', platform: 'Home console'},
            {value: 'uzebox', text: 'Uzebox', platform: 'Home console'},
            {value: 'pico8', text: 'PICO-8', platform: 'Home console'},
            {value: 'tic80', text: 'TIC-80', platform: 'Home console'},
            {value: 'lowresnx', text: 'Lowres', platform: 'Home console'},
            {value: 'wasm4', text: 'WASM4 fantasy console', platform: 'Home console'},

          ]
        },
        {
          label: 'Portable console',
          options: [
            {value: 'gameandwatch', text: 'Game & Watch', platform: 'Portable console'},
            {value: 'lcdgames', text: 'Handheld LCD Games', platform: 'Portable console'},
            {value: 'gb', text: 'Game Boy', platform: 'Portable console'},
            {value: 'lynx', text: 'Atari Lynx', platform: 'Portable console'},
            {value: 'gamegear', text: 'Game Gear', platform: 'Portable console'},
            {value: 'gamate', text: 'Gamate', platform: 'Portable console'},
            {value: 'gmaster', text: 'Game Master//Super Game', platform: 'Portable console'},
            {value: 'megaduck', text: 'Mega Duck/Cougar Boy', platform: 'Portable console'},
            {value: 'gamecom', text: 'Game.com', platform: 'Portable console'},
            {value: 'gbc', text: 'Game Boy Color', platform: 'Portable console'},
            {value: 'ngp', text: 'Neo Geo Pocket', platform: 'Portable console'},
            {value: 'ngpc', text: 'Neo Geo Pocket Color', platform: 'Portable console'},
            {value: 'wswan', text: 'WonderSwan', platform: 'Portable console'},
            {value: 'wswanc', text: 'WonderSwan Colo', platform: 'Portable console'},
            {value: 'gba', text: 'Game Boy Advance', platform: 'Portable console'},
            {value: 'pokemini', text: 'Pokémon Mini', platform: 'Portable console'},
            {value: 'nds', text: 'Nintendo DS', platform: 'Portable console'},
            {value: 'psp', text: 'PlayStation Portable', platform: 'Portable console'},
            {value: '3ds', text: 'Nintendo 3DS', platform: 'Portable console'},
            {value: 'psvita', text: 'PlayStation Vita', platform: 'Portable console'},
            {value: 'arduboy', text: 'Arduboy', platform: 'Portable console'},
          ]
        }
      ],
      platformSelected: 'mame',
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
    const baseURL = 'https://raw.githubusercontent.com/ramustha/batocera/main/';
    axios.get(baseURL + this.platformSelected + '-gamelist.xml')
        .then(response => {
          const x2js = new X2JS();
          const document = x2js.xml2js(response.data);
          this.items = document.gameList.game
          this.isBusy = false
          this.totalRows = this.items.length
        })
        .catch(error => {
          this.items = [];
          this.isBusy = false
          this.totalRows = this.items.length
        });
  },
  methods: {
    info(item, index, button) {
      this.infoModal.title = item.name
      this.infoModal.content = JSON.stringify(item, null, 2)
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
    },
    onPlatformChanged(e) {
      this.isBusy = true;
      this.platformSelected = e.target.value
      const baseURL = 'https://raw.githubusercontent.com/ramustha/batocera/main/';
      axios.get(baseURL + this.platformSelected + '-gamelist.xml')
          .then(response => {
            const x2js = new X2JS();
            const document = x2js.xml2js(response.data);
            this.items = document.gameList.game
            this.isBusy = false
            this.totalRows = this.items.length
          })
          .catch(error => {
            this.items = [];
            this.isBusy = false
            this.totalRows = this.items.length
          });
    },
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