import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Done from '@material-ui/icons/Done';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import * as React from 'react';

import { DefinitionEvaluation } from '../solver/candidates/types';

// tslint:disable:no-any
const styles = (theme: any) => ({
  root: {
    width: '80%',
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    minWidth: 300,
  },
  headCell: {
    fontSize: 16,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

// tslint:disable-next-line:no-any
const actionsStyles = (theme: any) => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

interface TablePaginationActionsProps {
  classes: any;
  count: number;
  onChangePage: Function;
  page: number;
  rowsPerPage: number;
  theme: any;
}

class TablePaginationActions extends React.Component<
  TablePaginationActionsProps
> {
  handleFirstPageButtonClick = (event: any) => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = (event: any) => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = (event: any) => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = (event: any) => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    );
  };

  render() {
    return (
      <div className={this.props.classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={this.props.page === 0}
          aria-label="First Page"
        >
          {this.props.theme.direction === 'rtl' ? (
            <LastPageIcon />
          ) : (
            <FirstPageIcon />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={this.props.page === 0}
          aria-label="Previous Page"
        >
          {this.props.theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={
            this.props.page >=
            Math.ceil(this.props.count / this.props.rowsPerPage) - 1
          }
          aria-label="Next Page"
        >
          {this.props.theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={
            this.props.page >=
            Math.ceil(this.props.count / this.props.rowsPerPage) - 1
          }
          aria-label="Last Page"
        >
          {this.props.theme.direction === 'rtl' ? (
            <FirstPageIcon />
          ) : (
            <LastPageIcon />
          )}
        </IconButton>
      </div>
    );
  }
}

const TablePaginationActionsWrapped = withStyles(actionsStyles, {
  withTheme: true,
})(TablePaginationActions);

interface DefinitionsEvalutaionDisplayProps {
  classes: any;
  definitionsEvaluation: DefinitionEvaluation[];
}

interface DefinitionsEvaluationDisplayState {
  page: number;
  rowsPerPage: number;
}

class DefinitionsEvaluationDisplay extends React.Component<
  DefinitionsEvalutaionDisplayProps,
  DefinitionsEvaluationDisplayState
> {
  constructor(props: DefinitionsEvalutaionDisplayProps) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 5,
    };
  }

  handleChangePage = (event: any, page: number) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event: any) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { rowsPerPage, page } = this.state;
    const emptyRows =
      rowsPerPage -
      Math.min(
        rowsPerPage,
        this.props.definitionsEvaluation.length - page * rowsPerPage,
      );

    return (
      <Paper className={this.props.classes.root}>
        <div className={this.props.classes.tableWrapper}>
          <Table className={this.props.classes.table}>
            <TableHead>
              <TableRow>
                <TableCell className={this.props.classes.headCell}>
                  Definition
                </TableCell>
                <TableCell className={this.props.classes.headCell}>
                  Composer
                </TableCell>
                <TableCell className={this.props.classes.headCell}>
                  Solution
                </TableCell>
                <TableCell className={this.props.classes.headCell}>
                  Solved?
                </TableCell>
                <TableCell className={this.props.classes.headCell}>
                  Top 5 Candidates
                </TableCell>
                <TableCell className={this.props.classes.headCell}>
                  Techniques
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.definitionsEvaluation
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: DefinitionEvaluation) => {
                  return (
                    <TableRow key={row.id} className={this.props.classes.row}>
                      <TableCell component="th" scope="row" dir="rtl">
                        {row.verbalClue}
                      </TableCell>
                      <TableCell dir="rtl">{row.composer}</TableCell>
                      <TableCell>{row.solution ? row.solution : ''}</TableCell>
                      <TableCell>{row.isSolved ? <Done /> : ''}</TableCell>
                      <TableCell>
                        {row.topFiveCandidates
                          ? row.topFiveCandidates.join(', ')
                          : ''}
                      </TableCell>
                      <TableCell>
                        {row.techniques ? row.techniques.join(', ') : ''}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={3}
                  count={this.props.definitionsEvaluation.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActionsWrapped}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles as any)(DefinitionsEvaluationDisplay);
