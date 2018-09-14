import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';

import { GlobalEvaluation } from '../solver/candidates/types';

// tslint:disable:no-any
const styles = (theme: any) => ({
  root: {
    width: '65%',
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 250,
  },
  headCell: {
    fontSize: 16,
  },
});

interface GlobalEvalutaionDisplayProps {
  classes: any;
  globalEvaluation: GlobalEvaluation;
}

class GlobalEvaluationDisplay extends React.Component<
  GlobalEvalutaionDisplayProps
> {
  render() {
    return (
      <Paper className={this.props.classes.root}>
        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={this.props.classes.headCell}>
                # Definitions
              </TableCell>
              <TableCell className={this.props.classes.headCell}>
                # Solved
              </TableCell>
              <TableCell className={this.props.classes.headCell}>
                Success Rate
              </TableCell>
              <TableCell className={this.props.classes.headCell}>
                # Top 5{' '}
              </TableCell>
              <TableCell className={this.props.classes.headCell}>
                Top 5 - Success Rate
              </TableCell>
              <TableCell className={this.props.classes.headCell}>
                Without Candidates
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                {this.props.globalEvaluation.definitionsAmount}
              </TableCell>
              <TableCell>{this.props.globalEvaluation.solvedAmount}</TableCell>
              <TableCell>{this.props.globalEvaluation.successRate}%</TableCell>
              <TableCell>{this.props.globalEvaluation.topFiveAmount}</TableCell>
              <TableCell>
                {this.props.globalEvaluation.topFiveCandidatesRate}%
              </TableCell>
              <TableCell>
                {this.props.globalEvaluation.wordsWithoutCandidates}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

export default withStyles(styles as any)(GlobalEvaluationDisplay);
