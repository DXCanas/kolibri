<template>

  <CoreMenuOption
    :label="$tr('device')"
    :link="url"
  >
    <mat-svg
      slot="icon"
      name="tablet_mac"
      category="hardware"
    />
  </CoreMenuOption>

</template>


<script>

  import { UserKinds } from 'kolibri.coreVue.vuex.constants';
  import CoreMenuOption from 'kolibri.coreVue.components.CoreMenuOption';
  import navComponents from 'kolibri.utils.navComponents';
  import urls from 'kolibri.urls';

  const component = {
    name: 'DeviceManagementSideNavEntry',
    components: {
      CoreMenuOption,
    },
    $trs: {
      device: 'Device',
    },
    computed: {
      url() {
        return urls['kolibri:devicemanagementplugin:device_management']();
      },
    },
    role: UserKinds.CAN_MANAGE_CONTENT,
    priority: 10,
  };

  navComponents.register(component);

  export default component;

</script>


<style lang="scss" scoped></style>
