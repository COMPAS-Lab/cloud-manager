import React, { useEffect, useState } from 'react';
// import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
// import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import { fetchProjects, fetchProjectToken } from '@linode/api-v4/lib/account/projects';
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
      maxHeight: 34,
      position: 'relative',
      minHeight: `34px`,
      cursor: 'pointer',
      border: 'none',
      [theme.breakpoints.down('sm')]: {
        maxHeight: 34,
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
  },
}));

const ProjectMenu: React.FC = () => {
    const classes = useStyles();
    const [projects, setProjects] = useState<Project[]>([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedProjectName, setSelectedProjectName] = useState('Select Project');

    useEffect(() => {
      fetchProjects().then(response => {
        setProjects(response);
      }).catch(error => {
        console.error("Error fetching projects:", error);
      });
    }, []);

    const handleSelectProject = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const projectId = e.target.value;
      const projectName = projects.find(project => project.id === projectId)?.name || 'Select Project';
      setSelectedProjectId(projectId);
      setSelectedProjectName(projectName);
      console.log(selectedProjectName);
      try {
        const token = fetchProjectToken(selectedProjectId);
        // window.localStorage.setItem('authentication/token', 'Bearer ' + token);
        console.log("token: ", token);
      } catch (error) {
        console.error("Error in Changing Project:", error);
      }
      setOpenSnackbar(true);

    };
  
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
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
        <div>
          <select
            className={classes.select}
            value={selectedProjectName}
            onChange={handleSelectProject}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="success">
            Switched to project: {selectedProjectName}
          </Alert>
        </Snackbar>
      </>
    );
  };
  
export default ProjectMenu;
