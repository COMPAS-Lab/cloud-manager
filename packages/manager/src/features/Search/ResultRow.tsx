import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { Tags } from 'src/components/Tags/Tags';
import { Typography } from 'src/components/Typography';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

import {
  StyledCreatedTableCell,
  StyledLabelTableCell,
  StyledLink,
  StyledRegionTableCell,
  StyledTableRow,
  StyledTagTableCell,
} from './ResultRow.styles';

interface ResultRowProps {
  result: Item;
  /* -- Clanode Change -- */
  showRegion?: boolean;
  /* -- Clanode Change End -- */
}

type CombinedProps = Props;

export const ResultRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { result, showRegion } = props;

  return (
    <StyledTableRow data-qa-result-row={result.label}>
      <StyledLabelTableCell>
        <StyledLink title={result.label} to={result.data.path}>
          {result.label}
        </Link>
        <Typography variant="body1">{result.data.description}</Typography>
      </TableCell>
      <TableCell className={classes.regionCell}>
        {
          /* -- Clanode Change -- */
          showRegion && result.data.region && (
            <RegionIndicator region={result.data.region} />
          )
          /* -- Clanode Change End -- */
        }
      </TableCell>
      <Hidden smDown>
        <TableCell className={classes.createdCell}>
          {result.data.created && (
            <Typography>
              <DateTimeDisplay value={result.data.created} />
            </Typography>
          )}
        </StyledCreatedTableCell>

        <StyledTagTableCell>
          <Tags data-testid={'result-tags'} tags={result.data.tags} />
        </StyledTagTableCell>
      </Hidden>
    </StyledTableRow>
  );
};
