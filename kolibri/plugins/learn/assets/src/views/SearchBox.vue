<template>

  <form
    class="search-box"
    @submit.prevent="search"
    @keydown.esc.prevent="handleEscKey"
  >
    <div class="search-box-row">
      <label class="visuallyhidden" for="searchfield">{{ $tr('searchBoxLabel') }}</label>
      <input
        v-model.trim="searchQuery"
        id="searchfield"
        type="search"
        class="search-input"
        ref="searchInput"
        :placeholder="$tr('searchBoxLabel')"
      >
      <div class="search-buttons-wrapper">
        <UiIconButton
          color="black"
          size="small"
          class="search-clear-button"
          :class="searchQuery === '' ? '' : 'search-clear-button-visible'"
          :ariaLabel="$tr('clearButtonLabel')"
          @click="searchQuery = ''"
        >
          <mat-svg
            name="clear"
            category="content"
          />
        </UiIconButton>

        <div class="search-submit-button-wrapper">
          <UiIconButton
            type="secondary"
            color="white"
            class="search-submit-button"
            :disabled="!searchUpdate"
            :class="{ 'rtl-icon': icon === 'arrow_forward' && isRtl }"
            :ariaLabel="$tr('startSearchButtonLabel')"
            @click="search"
          >
            <mat-svg
              v-if="icon === 'search'"
              name="search"
              category="action"
            />
            <mat-svg
              v-if="icon === 'arrow_forward'"
              name="arrow_forward"
              category="navigation"
            />
          </UiIconButton>
        </div>
      </div>
    </div>
    <div
      v-if="filters"
      class="filters"
    >
      <div
        class="ib"
      >
        <mat-svg
          category="content"
          name="filter_list"
          class="filter-icon"
        />
        <KSelect
          :label="$tr('resourceType')"
          :options="contentKindFilterOptions"
          :inline="true"
          :disabled="!contentKindFilterOptions.length"
          :value="contentKindFilterSelection"
          @change="updateFilter"
          ref="contentKindFilter"
          class="filter"
        />
      </div>
      <div
        class="ib"
      >
        <mat-svg
          category="navigation"
          name="apps"
          class="filter-icon"
        />
        <KSelect
          :label="$tr('channels')"
          :options="channelFilterOptions"
          :inline="true"
          :disabled="!channelFilterOptions.length"
          :value="channelFilterSelection"
          @change="updateFilter"
          ref="channelFilter"
          class="filter"
        />
      </div>
    </div>
  </form>

</template>


<script>

  import { mapGetters, mapState } from 'vuex';
  import UiIconButton from 'keen-ui/src/UiIconButton';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import KButton from 'kolibri.coreVue.components.KButton';
  import KSelect from 'kolibri.coreVue.components.KSelect';
  import { PageNames } from '../constants';

  const ALL_FILTER = null;

  const kindFilterToLabelMap = {
    [ContentNodeKinds.TOPIC]: 'topics',
    [ContentNodeKinds.EXERCISE]: 'exercises',
    [ContentNodeKinds.VIDEO]: 'videos',
    [ContentNodeKinds.AUDIO]: 'audio',
    [ContentNodeKinds.DOCUMENT]: 'documents',
    [ContentNodeKinds.HTML5]: 'html5',
  };

  export default {
    name: 'SearchBox',
    $trs: {
      searchBoxLabel: 'Search',
      clearButtonLabel: 'Clear',
      startSearchButtonLabel: 'Start search',
      resourceType: 'Type',
      all: 'All',
      topics: 'Topics',
      exercises: 'Exercises',
      videos: 'Videos',
      audio: 'Audio',
      documents: 'Documents',
      html5: 'Apps',
      channels: 'Channels',
    },
    components: {
      UiIconButton,
      KButton,
      KSelect,
    },
    props: {
      icon: {
        type: String,
        default: 'search',
        validator(val) {
          return ['search', 'arrow_forward'].includes(val);
        },
      },
      filters: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        searchQuery: this.$store.state.search.searchTerm,
        contentKindFilterSelection: {},
        channelFilterSelection: {},
      };
    },
    computed: {
      ...mapGetters({
        channels: 'getChannels',
      }),
      ...mapState('search', [
        'searchTerm',
        'channel_ids',
        'content_kinds',
        'kindFilter',
        'channelFilter',
      ]),
      allFilter() {
        return { label: this.$tr('all'), value: ALL_FILTER };
      },
      contentKindFilterOptions() {
        if (this.content_kinds.length) {
          const options = Object.keys(kindFilterToLabelMap)
            .filter(kind => this.content_kinds.includes(kind))
            .map(kind => ({
              label: this.$tr(kindFilterToLabelMap[kind]),
              value: kind,
            }));
          return [this.allFilter, ...options];
        }
        return [];
      },
      channelFilterOptions() {
        if (this.channel_ids.length) {
          const options = this.channels
            .filter(channel => this.channel_ids.includes(channel.id))
            .map(channel => ({
              label: channel.title,
              value: channel.id,
            }));
          return [this.allFilter, ...options];
        }
        return [];
      },
      filterUpdate() {
        return (
          this.contentKindFilterSelection.value !== this.kindFilter ||
          this.channelFilterSelection.value !== this.channelFilter
        );
      },
      searchUpdate() {
        return this.searchQuery !== this.searchTerm || this.filterUpdate;
      },
    },
    watch: {
      searchTerm(val) {
        this.searchQuery = val || '';
      },
    },
    beforeMount() {
      this.contentKindFilterSelection =
        this.contentKindFilterOptions.find(
          option => option.value === this.$store.state.search.kindFilter
        ) || this.allFilter;
      this.channelFilterSelection =
        this.channelFilterOptions.find(
          option => option.value === this.$store.state.search.channelFilter
        ) || this.allFilter;
    },
    methods: {
      handleEscKey() {
        if (this.searchQuery === '') {
          this.$emit('closeDropdownSearchBox');
        } else {
          this.searchQuery = '';
        }
      },
      updateFilter() {
        this.search(true);
      },
      search(filterUpdate = false) {
        if (this.searchQuery !== '') {
          const query = {
            searchTerm: this.searchQuery,
          };
          if (filterUpdate === true) {
            if (this.$refs.contentKindFilter.selection.value) {
              query.kind = this.$refs.contentKindFilter.selection.value;
            }
            if (this.$refs.channelFilter.selection.value) {
              query.channel_id = this.$refs.channelFilter.selection.value;
            }
          }
          this.$router.push({
            name: PageNames.SEARCH,
            query,
          });
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .search-box {
    margin-right: 8px;
  }

  .search-box-within-action-bar {
    width: 235px;
  }

  .search-box-row {
    display: table;
    width: 100%;
    max-width: 450px;
    background-color: white;
  }

  .search-input {
    display: table-cell;
    width: 100%;
    height: 36px;
    padding: 0;
    padding-left: 8px;
    margin: 0;
    color: $core-text-default;
    vertical-align: middle;
    background-color: white;
    border: 0;

    &::placeholder {
      color: $core-text-annotation;
    }

    // removes the IE clear button
    &::-ms-clear {
      display: none;
    }
  }

  .search-buttons-wrapper {
    display: table-cell;
    width: 78px;
    height: 36px;
    text-align: right;
    vertical-align: middle;
  }

  .search-clear-button {
    width: 24px;
    height: 24px;
    margin-right: 6px;
    margin-left: 6px;
    color: $core-text-default;
    vertical-align: middle;
    visibility: hidden;
  }

  .search-clear-button-visible {
    visibility: visible;
  }

  .search-submit-button {
    width: 36px;
    height: 36px;
    fill: white;
  }

  .search-submit-button-wrapper {
    display: inline-block;
    vertical-align: middle;
    background-color: $core-action-dark;
  }

  .filter-icon {
    position: absolute;
    top: 50%;
    bottom: 50%;
    margin-left: 12px;
    transform: translate(-50%, -50%);
  }

  .filter:nth-of-type(1) {
    margin-right: 16px;
  }

  .filter {
    margin-bottom: 16px;
    margin-left: 28px;
  }

  .filters {
    margin-top: 24px;
  }

  .ib {
    position: relative;
    display: inline-block;
  }

</style>
