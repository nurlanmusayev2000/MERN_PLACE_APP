import React, { useState } from 'react';
import ContainerItem from '../components/ContainerItem';
import Button from '../../shared/components/FormElements/Button';
import './ContainerList.css';
import Card from '../../shared/components/UIElement/Card';

const ContainerList = (props) => {
  // Add local state to manage the list
  const [containers, setContainers] = useState(props.items);

  // Function to remove a container from state
  const containerDeleteHandler = deletedId => {
    setContainers(prevItems => prevItems.filter(item => item.id !== deletedId));
  };

  if (containers.length === 0) {
    return (
      <div className='place-list center'>
        <Card>
          <h2 className='center'>No places found. Create a new one!</h2>
          <Button to="/container/new">Share Place</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className='place-list'>
      {containers.map(item => (
        <ContainerItem
          key={item.id}
          id={item.id}
          image={item.image}
          title={item.title}
          description={item.description}
          address={item.address}
          coordinates={item.location}
          creatorId={item.creatorId}
          onDelete={containerDeleteHandler} // Pass this to allow deletion
        />
      ))}
    </ul>
  );
};

export default ContainerList;
