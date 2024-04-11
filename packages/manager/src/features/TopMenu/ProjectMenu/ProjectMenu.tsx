import React, { useEffect, useState } from 'react';
// import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
// import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import {
  fetchProjects,
  fetchProjectToken,
} from '@linode/api-v4/lib/account/projects';
import { Project } from '@linode/api-v4/lib/account/types';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    display: 'flex',
    alignItems: 'center',
    '&[data-reach-menu-button]': {
      textTransform: 'inherit',
      borderRadius: 1,
      fontSize: '1rem',
      lineHeight: 1,
      fontFamily: theme.spacing() === 4 ? theme.font.normal : theme.font.bold,
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      padding: `2px 20px`,
      paddingRight: 12,
      maxHeight: 30,
      position: 'relative',
      minHeight: `34px`,
      cursor: 'pointer',
      border: 'none',
      [theme.breakpoints.down('sm')]: {
        maxHeight: 25,
        minWidth: 100,
      },
      '&:hover, &:focus': {
        backgroundColor: '#226dc3',
      },
      '&[aria-expanded="true"]': {
        backgroundColor: theme.palette.primary.light,
        '& $caret': {
          marginTop: 4,
          transform: 'rotate(180deg)',
        },
      },
    },
  },
  caret: {
    marginTop: 2,
    marginLeft: 4,
  },
  select: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: '10px',
    border: 'none',
    fontSize: theme.typography.fontSize,
    '&:focus': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

const ProjectMenu: React.FC = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState<Project[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return window.localStorage.getItem('selectedProjectId') || '';
  });

  useEffect(() => {
    fetchProjects()
      .then((response) => {
        setProjects(response);
        if (
          selectedProjectId &&
          !response.some((project) => project.id === selectedProjectId)
        ) {
          // If the saved project ID is not found among the fetched projects, clear the localStorage
          window.localStorage.removeItem('selectedProjectId');
          setSelectedProjectId('');
        }
      })
      .catch((error) => {
        enqueueSnackbar('Error fetching projects');
      });
  }, []);

  const handleSelectProject = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const projectId = e.target.value;
    // If the selected project is the current project, ignore
    if (projectId === selectedProjectId) return;
    const projectName =
      projects.find((project) => project.id === projectId)?.name ||
      'Select Project';
    setSelectedProjectId(projectId);
    window.localStorage.setItem('selectedProjectId', projectId);
    try {
      const token = await fetchProjectToken(projectId);
      if (token) {
        window.localStorage.setItem('authentication/token', token);
        window.location.reload();
      } else throw new Error('Failed to fetch project token');
    } catch (error) {
      enqueueSnackbar('Error switching to project: ' + projectName);
    }
    enqueueSnackbar('Switched to project: ' + projectName);
  };

  return (
    <>
      {/* <Menu>
            <MenuButton className={classes.button}>
                {selectedProject || 'Select Project'} <KeyboardArrowDown className={classes.caret} />
            </MenuButton>
            <MenuList>
                {projects.map((project) => (
                    <MenuItem key={project.id.toString()} onSelect={() => handleSelectProject(project.name)}>
                        {project.name}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu> */}
      {projects.length > 1 && (
        <div>
          <select
            className={classes.select}
            value={selectedProjectId}
            onChange={handleSelectProject}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

export default ProjectMenu;
