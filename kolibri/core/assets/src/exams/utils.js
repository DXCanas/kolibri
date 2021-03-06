import seededShuffle from 'seededshuffle';
import { assessmentMetaDataState } from 'kolibri.coreVue.vuex.mappers';
import {
  ExamResource,
  ExamLogResource,
  FacilityUserResource,
  ExamAttemptLogResource,
  ContentNodeResource,
} from 'kolibri.resources';
import ConditionalPromise from 'kolibri.lib.conditionalPromise';
import samePageCheckGenerator from 'kolibri.utils.samePageCheckGenerator';

function createQuestionList(questionSources) {
  return questionSources.reduce(
    (acc, val) =>
      acc.concat(
        Array.from(Array(val.number_of_questions).keys()).map(assessmentItemIndex => ({
          contentId: val.exercise_id,
          assessmentItemIndex,
        }))
      ),
    []
  );
}

function selectQuestionFromExercise(index, seed, contentNode) {
  const assessmentmetadata = assessmentMetaDataState(contentNode);
  return seededShuffle.shuffle(assessmentmetadata.assessmentIds, seed, true)[index];
}

// idk the best place to place this function
function getExamReport(store, examId, userId, questionNumber = 0, interactionIndex = 0) {
  return new Promise((resolve, reject) => {
    const examPromise = ExamResource.fetchModel({ id: examId });
    const examLogPromise = ExamLogResource.fetchCollection({
      getParams: {
        exam: examId,
        user: userId,
      },
    });
    const attemptLogPromise = ExamAttemptLogResource.fetchCollection({
      getParams: {
        exam: examId,
        user: userId,
      },
    });
    const userPromise = FacilityUserResource.fetchModel({ id: userId });

    ConditionalPromise.all([examPromise, examLogPromise, attemptLogPromise, userPromise]).only(
      samePageCheckGenerator(store),
      ([exam, examLogs, examAttempts, user]) => {
        const examLog = examLogs[0] || {};
        const seed = exam.seed;
        const questionSources = exam.question_sources;

        const questionList = createQuestionList(questionSources);

        const contentPromise = ContentNodeResource.fetchCollection({
          getParams: {
            in_exam: exam.id,
          },
        });

        contentPromise.only(
          samePageCheckGenerator(store),
          contentNodes => {
            const contentNodeMap = {};

            contentNodes.forEach(node => {
              contentNodeMap[node.id] = node;
            });

            // Only pick questions that are still on server
            const questions = questionList
              .filter(question => contentNodeMap[question.contentId])
              .map(question => ({
                itemId: selectQuestionFromExercise(
                  question.assessmentItemIndex,
                  seed,
                  contentNodeMap[question.contentId]
                ),
                contentId: question.contentId,
              }));

            // When all the Exercises are not available on the server
            if (questions.length === 0) {
              return resolve({ exam, examLog, user });
            }

            const allQuestions = questions.map((question, index) => {
              const attemptLog = examAttempts.filter(
                log => log.item === question.itemId && log.content_id === question.contentId
              );
              let examAttemptLog = attemptLog[0]
                ? attemptLog[0]
                : { interaction_history: [], correct: false, noattempt: true };
              if (attemptLog.length > 1) {
                let completionTimeStamp = attemptLog.map(function(att) {
                  return att.completion_timestamp;
                });
                examAttemptLog = attemptLog.find(
                  log => log.completion_timestamp === completionTimeStamp.sort().reverse()[0]
                );
              }
              return Object.assign(
                {
                  questionNumber: index + 1,
                },
                examAttemptLog
              );
            });

            allQuestions.sort((loga, logb) => loga.questionNumber - logb.questionNumber);

            const currentQuestion = questions[questionNumber];
            const itemId = currentQuestion.itemId;
            const exercise = contentNodeMap[currentQuestion.contentId];
            const currentAttempt = allQuestions[questionNumber];
            // filter out interactions without answers but keep hints and errors
            const currentInteractionHistory = currentAttempt.interaction_history.filter(
              interaction =>
                Boolean(
                  interaction.answer || interaction.type === 'hint' || interaction.type === 'error'
                )
            );
            const currentInteraction = currentInteractionHistory[interactionIndex];
            if (examLog.completion_timestamp) {
              examLog.completion_timestamp = new Date(examLog.completion_timestamp);
            }
            const payload = {
              exerciseContentNodes: [...contentNodes],
              exam,
              itemId,
              questions,
              currentQuestion,
              questionNumber: Number(questionNumber),
              currentAttempt,
              exercise,
              interactionIndex: Number(interactionIndex),
              currentInteraction,
              currentInteractionHistory,
              user,
              examAttempts: allQuestions,
              examLog,
            };
            resolve(payload);
          },
          error => reject(error)
        );
      },
      error => reject(error)
    );
  });
}

function canViewExam(exam, examLog) {
  return exam.active && !examLog.closed;
}

function canViewExamReport(exam, examLog) {
  return !canViewExam(exam, examLog);
}

export {
  createQuestionList,
  selectQuestionFromExercise,
  getExamReport,
  canViewExam,
  canViewExamReport,
};
