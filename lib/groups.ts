const groups1 = [
  'sensebox1',
  'sensebox2',
  'sensebox3',
  'sensebox4',
  'sensebox5',
];

const groups2 = [
  'sensebox6',
  'sensebox7',
  'sensebox8',
  'sensebox9',
  'sensebox10',
];

export const getGroups = (group: string) => {
  if (group === '') return [];

  if (groups1.includes(group.toLocaleLowerCase())) {
    return groups1;
  }

  if (groups2.includes(group.toLowerCase())) {
    return groups2;
  }

  return [];
};
