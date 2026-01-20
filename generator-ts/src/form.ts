import { forms_v1, google } from 'googleapis';
import { CalculatorRow, QuestionsPoolRow, L10nsRow } from './input/types';

export type CFormType = 'candidate' | 'expert';

export function initGoogleForms() {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/forms',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  const googleForms = google.forms({
    version: 'v1',
    auth,
  });
  return googleForms;
}

// https://developers.google.com/forms/api/reference/rest/v1/forms/get
export async function getForm(
  googleForms: forms_v1.Forms,
  calculator: CalculatorRow,
  key: string,
): Promise<forms_v1.Schema$Form> {
  // https://developers.google.com/forms/api/reference/rest/v1/forms/get
  // https://developers.google.com/forms/api/reference/rest/v1/forms#resource:-form
  const formG = await googleForms.forms.get({
    formId: key,
  });

  if (formG.status != 200) {
    throw new Error(
      `Calculator: ${calculator.Pos} - ${key} - ${formG.status}: ${formG.statusText}`,
    );
  }

  return formG.data;
}

// https://developers.google.com/forms/api/reference/rest/v1/forms/create
export async function createForm(
  googleForms: forms_v1.Forms,
  calculator: CalculatorRow,
  l10ns: L10nsRow,
  questions: QuestionsPoolRow[],
  type: CFormType,
): Promise<forms_v1.Schema$Form> {
  const title = `${calculator.ElectionName} - ${calculator.DistrictName} - ${type}`;
  // https://developers.google.com/forms/api/reference/rest/v1/forms/create
  // https://developers.google.com/forms/api/reference/rest/v1/forms#resource:-form
  const formC = await googleForms.forms.create({
    requestBody: {
      info: {
        title: title,
        // description: `${title} - ${calculator.Description}`,
      },
    },
  });

  console.log(`${title} - ${formC.data.formId}`);

  if (formC.status != 200) {
    throw new Error(
      `Calculator: ${calculator.Pos} - ${formC.status}: ${formC.statusText}`,
    );
  }

  const createItems = createFormQuestions(l10ns, questions, type).map(
    (item: forms_v1.Schema$Item, index: number) => {
      return {
        createItem: {
          item: item,
          location: {
            index: index,
          },
        },
      };
    },
  );

  console.info(`${title} has ${createItems.length} questions`);

  // https://developers.google.com/forms/api/reference/rest/v1/forms/batchUpdate#http-request
  const formU = await googleForms.forms.batchUpdate({
    formId: formC.data.formId,
    requestBody: {
      includeFormInResponse: true,
      requests: [
        {
          updateFormInfo: {
            info: {
              description: l10ns.FormDescription,
            },
            updateMask: 'description',
          },
        },
        ...createItems,
      ],
    },
  });

  if (formU.status != 200) {
    throw new Error(
      `Calculator: ${calculator.Pos} - ${formU.status}: ${formU.statusText}`,
    );
  }

  //items: createFormQuestions(calculator, questions),

  return formU.data.form;
}

function createFormQuestions(
  l10ns: L10nsRow,
  questions: QuestionsPoolRow[],
  type: CFormType,
): forms_v1.Schema$Item[] {
  const res = Array<forms_v1.Schema$Item>();

  res.push({
    title: l10ns.FormPersonName,
    questionItem: {
      question: {
        required: true,
        textQuestion: {
          paragraph: false,
        },
      },
    },
  });

  res.push({
    title: l10ns.FormPartyName,
    questionItem: {
      question: {
        required: true,
        textQuestion: {
          paragraph: false,
        },
      },
    },
  });

  res.push({
    title: l10ns.FormEmail,
    questionItem: {
      question: {
        required: true,
        textQuestion: {
          paragraph: false,
        },
      },
    },
  });

  res.push({
    title: l10ns.FormSecretCode,
    description: l10ns.FormSecretCodeDescription,
    questionItem: {
      question: {
        required: true,
        textQuestion: {
          paragraph: false,
        },
      },
    },
  });

  for (let i = 0; i < questions.length; i++) {
    const row = questions[i];
    if (row === undefined) {
      console.log(`Skipping question on position: ${i}`);
      continue;
    }
    const prefix = `${i + 1}/${questions.length})`;
    // https://developers.google.com/forms/api/reference/rest/v1/forms#item
    res.push({
      title: `${prefix} ${row.Question}`,
      description: row.Description,
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: [
              {
                value: l10ns.FormYes,
              },
              {
                value: l10ns.FormNo,
              },
              {
                value: l10ns.FormSkip,
              },
            ],
          },
        },
      },
    });

    res.push({
      title: `${prefix} ${l10ns.FormComment}`,
      questionItem: {
        question: {
          required: type === 'expert',
          textQuestion: {
            paragraph: true,
          },
        },
      },
    });

    res.push({
      title: `${prefix}. ${l10ns.FormIsImportant}`,
      questionItem: {
        question: {
          required: false,
          choiceQuestion: {
            type: 'CHECKBOX',
            options: [
              {
                value: l10ns.FormYes,
              },
            ],
          },
        },
      },
    });
  }

  res.push({
    title: l10ns.FormMotto,
    description: l10ns.FormMottoDescription,
    questionItem: {
      question: {
        required: type === 'candidate',
        textQuestion: {
          paragraph: false,
        },
      },
    },
  });

  res.push({
    title: l10ns.FormToAuthors,
    questionItem: {
      question: {
        required: false,
        textQuestion: {
          paragraph: true,
        },
      },
    },
  });

  return res;
}
