// src/utils/storage.js

const STORAGE_PREFIX = "istorii_pochemu_";

// Флаг: false — используем localStorage, true — Supabase
const USE_SUPABASE = false;

// --- Реализация для localStorage ---

const localStorageImpl = {
  clearAllAnswers: () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  getTaskKey: (id) => `${STORAGE_PREFIX}task_answer_${id}`,

  isTaskCorrect: (id) => {
    return localStorage.getItem(localStorageImpl.getTaskKey(id)) === 'true';
  },

  saveCorrectAnswer: (id) => {
    localStorage.setItem(localStorageImpl.getTaskKey(id), 'true');
  },

  migrateOldProgress: () => {
    const keys = Object.keys(localStorage);
    const oldProgressKeys = keys.filter(key => key.startsWith("progress_"));

    oldProgressKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.answeredTasks) {
          Object.keys(data.answeredTasks).forEach((taskId) => {
            localStorageImpl.saveCorrectAnswer(taskId);
          });
        }
      } catch (e) {
        console.error("Ошибка при миграции из", key, e);
      }
    });
  },

  clearAnswersByIds: (ids) => {
    ids.forEach((id) => {
      localStorage.removeItem(localStorageImpl.getTaskKey(id));
      localStorage.removeItem(`${STORAGE_PREFIX}answer_text_${id}`);
      localStorage.removeItem(`${STORAGE_PREFIX}task_inputs_${id}`);

      let i = 0;
      while (true) {
        const key = `${STORAGE_PREFIX}input_correct_${id}_${i}`;
        if (!localStorage.getItem(key)) break;
        localStorage.removeItem(key);
        i++;
      }
    });
  },
};

// --- Реализация для Supabase ---
// (полностью закомментирована, чтобы проект собирался)

/*
import { supabase } from './supabaseClient';

const supabaseImpl = {
  clearAllAnswers: async (userId) => {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('user_id', userId);
    if (error) console.error('Ошибка очистки ответов в Supabase:', error);
  },

  isTaskCorrect: async (id, userId) => {
    const { data, error } = await supabase
      .from('answers')
      .select('answer_correct')
      .eq('user_id', userId)
      .eq('task_id', id)
      .single();
    if (error) return false;
    return data?.answer_correct === true;
  },

  saveCorrectAnswer: async (id, userId) => {
    await supabase.from('answers').upsert({
      user_id: userId,
      task_id: id,
      answer_correct: true,
    });
  },

  migrateOldProgress: () => {},

  clearAnswersByIds: async (ids, userId) => {
    for (const id of ids) {
      await supabase
        .from('answers')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', id);
    }
  },
};
*/

const storage = localStorageImpl;

// Экспортируем нужные функции
export const clearAllAnswers = (userId) => storage.clearAllAnswers(userId);
export const isTaskCorrect = (id, userId) => storage.isTaskCorrect(id, userId);
export const saveCorrectAnswer = (id, userId) => storage.saveCorrectAnswer(id, userId);
export const migrateOldProgress = (userId) => storage.migrateOldProgress(userId);
export const clearAnswersByIds = (ids, userId) => storage.clearAnswersByIds(ids, userId);
export const getTaskKey = localStorageImpl.getTaskKey;

export function getSavedAnswer(taskId) {
  const key = `${STORAGE_PREFIX}answer_text_${taskId}`;
  return localStorage.getItem(key) || '';
}

export function saveAnswerText(taskId, text) {
  const key = `${STORAGE_PREFIX}answer_text_${taskId}`;
  localStorage.setItem(key, text);
}
