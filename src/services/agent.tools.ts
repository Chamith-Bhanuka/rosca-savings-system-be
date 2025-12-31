import { Group } from '../model/group.model';
import { Status } from '../model/group.model';

export const searchGroupTool = async (params: {
  sortBy?: 'amount' | 'startDate';
  order?: 'asc' | 'desc';
  limit?: number;
}) => {
  try {
    const sortConfig: any = {};
    if (params.sortBy === 'amount')
      sortConfig.amount = params.order === 'desc' ? -1 : 1;
    if (params.sortBy === 'startDate')
      sortConfig.startDate = params.order === 'desc' ? -1 : 1;

    const groups = await Group.find({
      status: Status.Active,
      $expr: { $lt: [{ $size: '$members' }, '$totalMembers'] },
    })
      .sort(sortConfig)
      .limit(params.limit || 3)
      .select('name amount frequency totalMembers _id startDate');

    return groups.map((g) => ({
      name: g.name,
      amount: g.amount,
      frequency: g.frequency,
      link: '/groups/${g.id}',
      startsIn: new Date(g.startDate).toDateString(),
    }));
  } catch (err: any) {
    console.error(err);
    return 'Error searching groups.';
  }
};
