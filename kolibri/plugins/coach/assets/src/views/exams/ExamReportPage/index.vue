<template>

  <div>
    <AssignmentSummary
      :kind="examKind"
      :title="exam.title"
      :active="exam.active"
      :recipients="exam.assignments"
      :groups="learnerGroups"
      @changeStatus="setExamsModal(AssignmentActions.CHANGE_STATUS)"
    >
      <KDropdownMenu
        slot="optionsDropdown"
        :text="$tr('options')"
        :options="actionOptions"
        appearance="raised-button"
        @select="handleSelection"
      />
    </AssignmentSummary>

    <h2>{{ $tr('examReport') }}</h2>

    <KCheckbox
      :label="$tr('viewByGroups')"
      :checked="viewByGroups"
      @change="viewByGroups = !viewByGroups"
      :disabled="viewByGroupsIsDisabled"
    />

    <template v-if="reportGroupings.length">
      <div
        v-for="(reportGrouping, i) in reportGroupings"
        :key="i"
      >
        <h3>
          {{ viewByGroups ? reportGrouping[0].group.name || $tr('ungrouped') : $tr('allLearners') }}
        </h3>
        <p class="average-score">{{ getAverageScore(reportGrouping) }}</p>

        <CoreTable>
          <caption class="visuallyhidden">{{ $tr('examReport') }}</caption>
          <thead slot="thead">
            <tr>
              <th class="core-table-icon-col"></th>
              <th class="core-table-main-col">{{ $tr('name') }}</th>
              <th>{{ $tr('progress') }}</th>
              <th>{{ $tr('score') }}</th>
              <th v-if="!viewByGroups">{{ $tr('group') }}</th>
            </tr>
          </thead>
          <tbody slot="tbody">
            <tr v-for="(examTaker, i) in reportGrouping" :key="i">
              <td class="core-table-icon-col">
                <ContentIcon :kind="USER" />
              </td>
              <td class="core-table-main-col">
                <KRouterLink
                  v-if="examTaker.progress !== undefined"
                  :text="examTaker.name"
                  :to="examDetailPageLink(examTaker.id)"
                />
                <template v-else>
                  {{ examTaker.name }}
                </template>
              </td>

              <td>
                <template v-if="(examTaker.progress === exam.question_count) || examTaker.closed">
                  {{ $tr('completed') }}
                </template>
                <template v-else-if="examTaker.progress !== undefined">
                  {{ $tr('remaining', { num: (exam.question_count - examTaker.progress) }) }}
                </template>
                <template v-else>
                  {{ $tr('notstarted') }}
                </template>
              </td>

              <td>

                {{
                  examTaker.score === undefined ?
                    '–' :
                    $tr('scorePercentage', { num: examTaker.score / exam.question_count })
                }}
              </td>

              <td v-if="!viewByGroups">{{ examTaker.group.name || '–' }}</td>
            </tr>
          </tbody>
        </CoreTable>
      </div>
    </template>

    <p v-else>{{ $tr('noExamData') }}</p>

    <ManageExamModals />
  </div>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import samePageCheckGenerator from 'kolibri.utils.samePageCheckGenerator';
  import CoreTable from 'kolibri.coreVue.components.CoreTable';
  import ContentIcon from 'kolibri.coreVue.components.ContentIcon';
  import sumBy from 'lodash/sumBy';
  import orderBy from 'lodash/orderBy';
  import KRouterLink from 'kolibri.coreVue.components.KRouterLink';
  import { USER, ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import KDropdownMenu from 'kolibri.coreVue.components.KDropdownMenu';
  import KCheckbox from 'kolibri.coreVue.components.KCheckbox';
  import { PageNames } from '../../../constants';
  import { Modals as ExamModals } from '../../../constants/examConstants';
  import { AssignmentActions } from '../../../constants/assignmentsConstants';
  import AssignmentSummary from '../../assignments/AssignmentSummary';
  import ManageExamModals from './ManageExamModals';

  export default {
    name: 'ExamReportPage',
    metaInfo() {
      return {
        title: this.exam.title,
      };
    },
    components: {
      ContentIcon,
      CoreTable,
      KRouterLink,
      KDropdownMenu,
      AssignmentSummary,
      ManageExamModals,
      KCheckbox,
    },
    data() {
      return {
        viewByGroups: false,
      };
    },
    computed: {
      ...mapState(['classId', 'reportRefreshInterval']),
      ...mapState('examReport', ['examTakers', 'exam', 'learnerGroups']),
      viewByGroupsIsDisabled() {
        return !this.learnerGroups.length || this.examTakers.every(learner => !learner.group.id);
      },
      reportGroupings() {
        let reportGroupings;
        if (this.viewByGroups) {
          reportGroupings = this.learnerGroups
            .map(group => this.examTakers.filter(learner => learner.group.id === group.id))
            .filter(grouping => grouping.length !== 0);
          reportGroupings = orderBy(
            reportGroupings,
            [grouping => grouping[0].group.name.toUpperCase()],
            ['asc']
          );
          reportGroupings.push(this.examTakers.filter(learner => !learner.group.id));
        } else {
          reportGroupings = [this.examTakers];
        }
        return reportGroupings.filter(grouping => grouping.length !== 0);
      },
      AssignmentActions() {
        return AssignmentActions;
      },
      USER() {
        return USER;
      },
      examKind() {
        return ContentNodeKinds.EXAM;
      },
      actionOptions() {
        return [
          { label: this.$tr('previewExam') },
          { label: this.$tr('editDetails') },
          { label: this.$tr('copyExamOptionLabel') },
          { label: this.$tr('delete') },
        ];
      },
    },
    mounted() {
      this.intervalId = setInterval(this.refreshReportData, this.reportRefreshInterval);
    },
    beforeDestroy() {
      this.intervalId = clearInterval(this.intervalId);
    },
    methods: {
      ...mapActions('examReport', ['setExamsModal']),
      // The data needed to do a proper refresh. See showExamReportPage for details
      refreshReportData() {
        return this.$store.dispatch('examReport/setTableData', {
          examId: this.exam.id,
          classId: this.classId,
          isSamePage: samePageCheckGenerator(this.$store),
        });
      },
      handleSelection(optionSelected) {
        const action = optionSelected.label;
        if (action === this.$tr('previewExam')) {
          this.setExamsModal(ExamModals.PREVIEW_EXAM);
        } else if (action === this.$tr('editDetails')) {
          this.setExamsModal(AssignmentActions.EDIT_DETAILS);
        } else if (action === this.$tr('copyExamOptionLabel')) {
          this.setExamsModal(AssignmentActions.COPY);
        } else if (action === this.$tr('delete')) {
          this.setExamsModal(AssignmentActions.DELETE);
        }
      },
      examDetailPageLink(id) {
        return {
          name: PageNames.EXAM_REPORT_DETAIL_ROOT,
          params: {
            classId: this.classId,
            examId: this.exam.id,
            userId: id,
          },
        };
      },
      getAverageScore(learners) {
        const examsInProgress = learners.filter(learner => learner.progress !== undefined);
        const totalScores = sumBy(examsInProgress, 'score');
        const averageScore = totalScores / examsInProgress.length / this.exam.question_count;
        return averageScore >= 0
          ? this.$tr('averageScore', { num: averageScore })
          : this.$tr('noAverageScore');
      },
    },
    $trs: {
      averageScore: 'Average score: {num, number, percent}',
      noAverageScore: 'Average score: –',
      examReport: 'Exam report',
      completed: 'Completed',
      remaining: '{ num, number } {num, plural, one {question} other {questions}} remaining',
      notstarted: 'Not started',
      name: 'Full Name',
      progress: 'Progress',
      score: 'Score',
      scorePercentage: '{num, number, percent}',
      group: 'Group',
      noExamData: 'No data to show.',
      options: 'Options',
      previewExam: 'Preview',
      editDetails: 'Edit details',
      copyExamOptionLabel: 'Copy exam',
      delete: 'Delete',
      viewByGroups: 'View by groups',
      allLearners: 'All learners',
      started: 'Started',
      ungrouped: 'Ungrouped',
    },
  };

</script>


<style lang="scss" scoped></style>
